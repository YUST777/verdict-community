import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';
import { fullRegistrationSchema, extractUniversityDomain, extractUsername } from '@/lib/validation';
import { getAuthCookieOptions } from '@/lib/cookie';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const JWT_EXPIRES_IN = '30d';

export async function POST(req: NextRequest) {
    try {
        // Rate limit registration attempts
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`register:${ip}`, 3, 60)) {
            return NextResponse.json(
                { success: false, error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await req.json();

        // Check if this is a simple OAuth-style registration (existing flow)
        // or a full university registration (new 3-step flow)
        const isUniversityRegistration = body.name && body.telephone && body.faculty;

        if (isUniversityRegistration) {
            return handleUniversityRegistration(body);
        } else {
            return handleSimpleRegistration(body);
        }

    } catch (err) {
        console.error('Register Error:', err);
        return NextResponse.json(
            { success: false, error: 'Registration failed' },
            { status: 500 }
        );
    }
}

// ─── Simple Registration (Public Tier - OAuth-style) ───────────────

async function handleSimpleRegistration(body: { email?: string; password?: string }) {
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json(
            { success: false, error: 'Email and password required' },
            { status: 400 }
        );
    }

    if (password.length < 9) {
        return NextResponse.json(
            { success: false, error: 'Password must be at least 9 characters' },
            { status: 400 }
        );
    }

    // Require at least one uppercase, one lowercase, and one number
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return NextResponse.json(
            { success: false, error: 'Password must contain uppercase, lowercase, and a number' },
            { status: 400 }
        );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const blindIndex = createBlindIndex(normalizedEmail);

    // Check if user exists
    const existingUser = await query(
        'SELECT id FROM public.users WHERE email_blind_index = $1',
        [blindIndex]
    );

    if (existingUser.rows.length > 0) {
        return NextResponse.json(
            { success: false, error: 'Registration failed. Please try again or use a different email.' },
            { status: 400 }
        );
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Encrypt Email
    const encryptedEmail = encrypt(normalizedEmail);

    // Insert User (Public Tier)
    const newUserResult = await query(
        `INSERT INTO public.users (email, email_blind_index, password_hash, tier, created_at)
         VALUES ($1, $2, $3, 'public', NOW())
         RETURNING id`,
        [encryptedEmail, blindIndex, passwordHash]
    );

    if (newUserResult.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    return createAuthResponse(newUserResult.rows[0].id, normalizedEmail);
}

// ─── University Registration (University Tier - 3-step flow) ────────

async function handleUniversityRegistration(body: Record<string, unknown>) {
    // Validate full registration data
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

    // Verify email was verified via OTP
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

    // Check if user already exists
    const existingUser = await query(
        'SELECT id FROM public.users WHERE email_blind_index = $1',
        [emailBlindIndex]
    );

    if (existingUser.rows.length > 0) {
        return NextResponse.json(
            { success: false, error: 'Account already exists. Please login instead.' },
            { status: 400 }
        );
    }

    // Get university from email domain
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

    // If no university found, still allow registration (public tier)
    // but log it for admin review

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Encrypt sensitive fields
    const encryptedEmail = encrypt(normalizedEmail);
    const encryptedName = encrypt(data.name);
    const encryptedTelephone = encrypt(data.telephone);
    const encryptedStudentId = encrypt(data.studentId);
    const encryptedNationalId = data.nationalId ? encrypt(data.nationalId) : null;

    // Create blind indexes for searchable fields
    const studentIdBlindIndex = createBlindIndex(data.studentId);
    const nationalIdBlindIndex = data.nationalId ? createBlindIndex(data.nationalId) : null;
    const telephoneBlindIndex = createBlindIndex(data.telephone);

    // Extract Codeforces/LeetCode usernames from URLs if provided
    const codeforcesHandle = data.codeforcesProfile
        ? extractUsername(data.codeforcesProfile, 'codeforces') || data.codeforcesProfile
        : null;
    const leetcodeHandle = data.leetcodeProfile
        ? extractUsername(data.leetcodeProfile, 'leetcode') || data.leetcodeProfile
        : null;

    // Start transaction
    const client = await query('BEGIN', []);

    try {
        // Create user (University Tier)
        const userResult = await query(
            `INSERT INTO public.users (
                email, email_blind_index, password_hash, name, 
                university_id, tier, codeforces_handle, leetcode_handle,
                is_email_verified, faculty, student_level,
                student_id_encrypted, student_id_blind_index,
                national_id_encrypted, national_id_blind_index,
                telephone_encrypted, telephone_blind_index,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, 'university', $6, $7, true, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
            RETURNING id`,
            [
                encryptedEmail, emailBlindIndex, passwordHash, encryptedName,
                universityId, codeforcesHandle, leetcodeHandle,
                data.faculty, data.studentLevel,
                encryptedStudentId, studentIdBlindIndex,
                encryptedNationalId, nationalIdBlindIndex,
                encryptedTelephone, telephoneBlindIndex
            ]
        );

        const userId = userResult.rows[0].id;

        // Grant "First Steps" achievement
        const achievementResult = await query(
            'SELECT id FROM public.achievements WHERE name = $1',
            ['First Steps']
        );

        if (achievementResult.rows.length > 0) {
            await query(
                `INSERT INTO public.user_achievements (user_id, achievement_id, earned_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (user_id, achievement_id) DO NOTHING`,
                [userId, achievementResult.rows[0].id]
            );
        }

        // Initialize user streak
        await query(
            `INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
             VALUES ($1, 0, 0, NOW())
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
        );

        await query('COMMIT', []);

        // Clean up OTP record
        await query(
            'DELETE FROM public.email_verification_otps WHERE email_blind_index = $1',
            [emailBlindIndex]
        );

        return createAuthResponse(userId, normalizedEmail, data.name);

    } catch (err) {
        await query('ROLLBACK', []);
        throw err;
    }
}

// ─── Create Auth Response with JWT ──────────────────────────────────

function createAuthResponse(userId: string, email: string, name?: string) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET missing');
    }

    const token = jwt.sign(
        { id: userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const response = NextResponse.json({
        success: true,
        user: { id: userId, email, name }
    });

    // Set Cookie
    response.cookies.set('authToken', token, getAuthCookieOptions());

    return response;
}
