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

        // OTP functions are disabled: bypass verification check and treat as already verified
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
    } catch (err) {
        console.error('Send OTP Error:', err instanceof Error ? err.message : 'Unknown');
        return NextResponse.json(
            { success: false, error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
