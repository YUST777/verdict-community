import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query } from '@/lib/db';
import { createBlindIndex, generateOTP, hashOTP } from '@/lib/encryption';
import { sendEmail } from '@/lib/email';
import { universityEmailSchema, validateEmailDomainExists, extractUniversityDomain } from '@/lib/validation';

const OTP_EXPIRY_MINUTES = 10;

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`send-otp:${ip}`, 5, 60)) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email } = body;

        const emailResult = universityEmailSchema.safeParse(email);
        if (!emailResult.success) {
            return NextResponse.json(
                { success: false, error: emailResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // MX record validation
        const domainValid = await validateEmailDomainExists(normalizedEmail);
        if (!domainValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid email domain. Please use a valid university email.' },
                { status: 400 }
            );
        }

        // Extract university domain and look up
        const universityDomain = extractUniversityDomain(normalizedEmail);
        if (!universityDomain) {
            return NextResponse.json(
                { success: false, error: 'Could not identify university from email.' },
                { status: 400 }
            );
        }

        let universityName = 'Your University';
        try {
            const universityResult = await query(
                'SELECT id, name FROM public.universities WHERE email_domain = $1',
                [universityDomain]
            );
            if (universityResult.rows.length > 0) {
                universityName = universityResult.rows[0].name;
            }
            // Allow registration even if university not in DB — they just won't have a university_id
        } catch { /* non-critical */ }

        const emailBlindIndex = createBlindIndex(normalizedEmail);

        // Check if already verified
        const existingVerification = await query(
            'SELECT verified_at FROM public.email_verification_otps WHERE email_blind_index = $1 AND verified_at IS NOT NULL',
            [emailBlindIndex]
        );

        if (existingVerification.rows.length > 0) {
            const existingUser = await query(
                'SELECT id FROM public.users WHERE email_blind_index = $1',
                [emailBlindIndex]
            );
            return NextResponse.json({
                success: true,
                alreadyVerified: true,
                hasAccount: existingUser.rows.length > 0,
                university: universityName,
            });
        }

        // Generate real OTP — no dev bypass
        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await query('DELETE FROM public.email_verification_otps WHERE email_blind_index = $1', [emailBlindIndex]);

        await query(
            `INSERT INTO public.email_verification_otps 
             (email_blind_index, otp_hash, expires_at, attempts, created_at)
             VALUES ($1, $2, $3, 0, NOW())`,
            [emailBlindIndex, otpHash, expiresAt]
        );

        // Send OTP email
        await sendEmail({
            to: normalizedEmail,
            subject: 'Verify your email - Verdict',
            text: `Your verification code is: ${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #0A0A0A;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981; margin: 0; font-size: 28px;">Verdict</h1>
    <p style="color: #888; font-size: 14px; margin-top: 5px;">Egypt's ICPC Training Hub</p>
  </div>
  <h2 style="color: #ffffff; text-align: center; font-size: 20px;">Verify Your Email</h2>
  <p style="color: #cccccc; font-size: 16px; text-align: center;">Welcome from <strong style="color: #10b981;">${universityName}</strong>!</p>
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
    <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your verification code</p>
    <p style="color: #10b981; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
  </div>
  <p style="color: #888; font-size: 14px; text-align: center;">This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
  <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
  <p style="color: #666; font-size: 12px; text-align: center;">If you didn't request this code, please ignore this email.</p>
</div>`
        });

        return NextResponse.json({
            success: true,
            message: 'Verification code sent',
            university: universityName,
        });
    } catch (err) {
        console.error('Send OTP Error:', err instanceof Error ? err.message : 'Unknown');
        return NextResponse.json(
            { success: false, error: 'Failed to send verification code' },
            { status: 500 }
        );
    }
}
