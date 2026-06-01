import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';
import { fullRegistrationSchema, extractUniversityDomain, extractUsername } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`register:${ip}`, 3, 60)) {
            return NextResponse.json(
                { success: false, error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        return handleUniversityRegistration(body);

    } catch (err) {
        console.error('Register Error:', err);
        return NextResponse.json(
            { success: false, error: 'Registration failed' },
            { status: 500 }
        );
    }
}

async function handleUniversityRegistration(body: Record<string, unknown>) {
    const validationResult = fullRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        return NextResponse.json(
            { success: false, error: `${firstError.path.join('.')}: ${firstError.message}` },
            { status: 400 }
        );
    }

    const data = validationResult.data;
    const normalizedEmail = data.email.trim().toLowerCase();
    const emailBlindIndex = createBlindIndex(normalizedEmail);

    // 1. Verify email via OTP (Bypassed since OTP functions are disabled)
    /*
    const verificationResult = await query(
        'SELECT verified_at FROM public.email_verification_otps WHERE email_blind_index = $1 AND verified_at IS NOT NULL',
        [emailBlindIndex]
    );

    if (verificationResult.rows.length === 0) {
        return NextResponse.json(
            { success: false, error: 'Email not verified. Please complete email verification first.' },
            { status: 400 }
        );
    }
    */

    // 2. Check if user is already logged in (Linking flow)
    const supabase = await createClient();
    const { data: { user: existingUser } } = await supabase.auth.getUser();
    
    let authId: string;

    if (existingUser) {
        // Use existing Auth ID for linking
        authId = existingUser.id;
    } else {
        // Register new user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: data.password,
            options: {
                data: {
                    full_name: data.name,
                }
            }
        });

        if (authError) {
            return NextResponse.json(
                { success: false, error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { success: false, error: 'Failed to create auth account' },
                { status: 500 }
            );
        }
        authId = authData.user.id;
    }

    // 3. Process extended profile data
    const universityDomain = extractUniversityDomain(normalizedEmail);
    let universityId: number | null = null;

    if (universityDomain) {
        const universityResult = await query(
            'SELECT id FROM public.universities WHERE email_domain = $1',
            [universityDomain]
        );
        if (universityResult.rows.length > 0) {
            universityId = universityResult.rows[0].id;
        }
    }

    const encryptedEmail = encrypt(normalizedEmail);
    const encryptedName = encrypt(data.name);
    const encryptedTelephone = encrypt(data.telephone);
    const encryptedStudentId = encrypt(data.studentId);
    const encryptedNationalId = data.nationalId ? encrypt(data.nationalId) : null;

    const studentIdBlindIndex = createBlindIndex(data.studentId);
    const nationalIdBlindIndex = data.nationalId ? createBlindIndex(data.nationalId) : null;
    const telephoneBlindIndex = createBlindIndex(data.telephone);

    const codeforcesHandle = data.codeforcesProfile
        ? extractUsername(data.codeforcesProfile, 'codeforces') || data.codeforcesProfile
        : null;
    const leetcodeHandle = data.leetcodeProfile
        ? extractUsername(data.leetcodeProfile, 'leetcode') || data.leetcodeProfile
        : null;

    // 4. Sync to public.users table
    try {
        await query('BEGIN', []);
        
        const userResult = await query(
            `INSERT INTO public.users (
                email, email_blind_index, auth_id, name, 
                university_id, tier, codeforces_handle, leetcode_handle,
                is_email_verified, faculty, student_level,
                student_id_encrypted, student_id_blind_index,
                national_id_encrypted, national_id_blind_index,
                telephone_encrypted, telephone_blind_index,
                created_at, password_hash, edu_eg_status
            ) VALUES ($1, $2, $3, $4, $5, 'university', $6, $7, true, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), 'supabase-managed', 'verified')
            ON CONFLICT (auth_id) DO UPDATE SET
                university_id = EXCLUDED.university_id,
                tier = EXCLUDED.tier,
                faculty = EXCLUDED.faculty,
                student_level = EXCLUDED.student_level,
                student_id_encrypted = EXCLUDED.student_id_encrypted,
                student_id_blind_index = EXCLUDED.student_id_blind_index,
                national_id_encrypted = EXCLUDED.national_id_encrypted,
                national_id_blind_index = EXCLUDED.national_id_blind_index,
                telephone_encrypted = EXCLUDED.telephone_encrypted,
                telephone_blind_index = EXCLUDED.telephone_blind_index,
                edu_eg_status = 'verified',
                is_email_verified = true
            RETURNING id`,
            [
                encryptedEmail, emailBlindIndex, authId, encryptedName,
                universityId, codeforcesHandle, leetcodeHandle,
                data.faculty, data.studentLevel,
                encryptedStudentId, studentIdBlindIndex,
                encryptedNationalId, nationalIdBlindIndex,
                encryptedTelephone, telephoneBlindIndex
            ]
        );

        const userId = userResult.rows[0].id;

        // Achievements and Streak initialization
        await query(
            `INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
             SELECT $1, id, NOW() FROM public.achievements WHERE name = 'First Steps'
             ON CONFLICT (user_id, achievement_id) DO NOTHING`,
            [userId]
        );

        // Streak initialization is now handled via the default stats JSONB column in users table

        await query('COMMIT', []);

        await query(
            'DELETE FROM public.email_verification_otps WHERE email_blind_index = $1',
            [emailBlindIndex]
        );

        return NextResponse.json({
            success: true,
            user: { id: userId, email: normalizedEmail, name: data.name }
        });

    } catch (err) {
        await query('ROLLBACK', []);
        console.error('Database Sync Error:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to complete profile registration' },
            { status: 500 }
        );
    }
}
