import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query } from '@/lib/db';
import { createBlindIndex, hashOTP } from '@/lib/encryption';
import { otpSchema, emailSchema } from '@/lib/validation';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
    try {
        // Rate limit verification attempts
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`verify-otp:${ip}`, 10, 60)) {
            return NextResponse.json(
                { success: false, error: 'Too many attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email, code } = body;

        // Validate inputs
        const emailResult = emailSchema.safeParse(email);
        const otpResult = otpSchema.safeParse(code);

        if (!emailResult.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (!otpResult.success) {
            return NextResponse.json(
                { success: false, error: otpResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailBlindIndex = createBlindIndex(normalizedEmail);

        // Get OTP record
        const otpResult2 = await query(
            `SELECT id, otp_hash, expires_at, attempts, verified_at 
             FROM public.email_verification_otps 
             WHERE email_blind_index = $1`,
            [emailBlindIndex]
        );

        if (otpResult2.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No verification code found. Please request a new one.' },
                { status: 400 }
            );
        }

        const otpRecord = otpResult2.rows[0];

        // Check if already verified
        if (otpRecord.verified_at) {
            return NextResponse.json(
                { success: true, alreadyVerified: true },
                { status: 200 }
            );
        }

        // Check if expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            // Delete expired OTP
            await query(
                'DELETE FROM public.email_verification_otps WHERE id = $1',
                [otpRecord.id]
            );
            return NextResponse.json(
                { success: false, error: 'Code expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if too many attempts
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            // Delete OTP after too many failed attempts
            await query(
                'DELETE FROM public.email_verification_otps WHERE id = $1',
                [otpRecord.id]
            );
            return NextResponse.json(
                { success: false, error: 'Too many failed attempts. Please request a new code.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const providedHash = hashOTP(code);
        if (providedHash !== otpRecord.otp_hash) {
            // Increment attempts
            await query(
                'UPDATE public.email_verification_otps SET attempts = attempts + 1 WHERE id = $1',
                [otpRecord.id]
            );
            
            const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts - 1;
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
                },
                { status: 400 }
            );
        }

        // Mark as verified
        await query(
            'UPDATE public.email_verification_otps SET verified_at = NOW() WHERE id = $1',
            [otpRecord.id]
        );

        // Check if user already exists (returning user)
        const existingUser = await query(
            'SELECT id, name FROM public.users WHERE email_blind_index = $1',
            [emailBlindIndex]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json({
                success: true,
                verified: true,
                hasAccount: true,
                userName: existingUser.rows[0].name
            });
        }

        // Applications table removed

        return NextResponse.json({
            success: true,
            verified: true,
            hasAccount: false,
            hasApplication: false
        });

    } catch (err) {
        console.error('Verify OTP Error:', err);
        return NextResponse.json(
            { success: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
