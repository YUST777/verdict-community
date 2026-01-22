import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';
import jwt from 'jsonwebtoken';
// crypto import removed - not currently used

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const JWT_EXPIRES_IN = '24h';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { access_token } = body;

        if (!access_token) {
            return NextResponse.json({ success: false, error: 'Token required' }, { status: 400 });
        }

        // Verify user via Supabase
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser(access_token);

        if (error || !user || !user.email) {
            console.error('Supabase Token Validation Failed:', error);
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const email = user.email;
        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Check if user exists in our local DB
        const userResult = await query(
            'SELECT id, email, application_id FROM public.users WHERE email_blind_index = $1',
            [blindIndex]
        );

        let userId: number;
        let appId: number | null = null;

        if (userResult.rows.length > 0) {
            // User exists
            const dbUser = userResult.rows[0];
            userId = dbUser.id;
            appId = dbUser.application_id;

            await query('UPDATE public.users SET last_login_at = NOW() WHERE id = $1', [userId]);

        } else {
            // Register new user (Same logic as callback)
            const name = user.user_metadata?.full_name || email.split('@')[0];

            const appResult = await query(
                `INSERT INTO public.applications (name, faculty, student_id, student_level, telephone, created_at, updated_at)
                 VALUES ($1, 'Unknown', 'Unknown', 'Unknown', 'Unknown', NOW(), NOW())
                 RETURNING id`,
                [name]
            );

            if (appResult.rows.length === 0) {
                throw new Error('Failed to create application profile');
            }
            appId = appResult.rows[0].id;

            const encryptedEmail = encrypt(normalizedEmail);
            // Insert placeholder for password_hash since it's OAuth/External login
            const newUserResult = await query(
                `INSERT INTO public.users (email, email_blind_index, password_hash, application_id, is_verified, role, created_at)
                 VALUES ($1, $2, $3, $4, true, 'trainee', NOW())
                 RETURNING id`,
                [encryptedEmail, blindIndex, 'oauth_user', appId]
            );

            if (newUserResult.rows.length === 0) {
                throw new Error('Failed to create user');
            }
            userId = newUserResult.rows[0].id;
        }

        // Generate Custom JWT
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET missing');
        }

        const token = jwt.sign(
            { id: userId, email: normalizedEmail, applicationId: appId },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const response = NextResponse.json({ success: true });

        // Set Cookie
        response.cookies.set('authToken', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: 'lax',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            domain: process.env.NODE_ENV === 'production' ? '.verdict.run' : undefined
        });

        return response;

    } catch (err) {
        console.error('Exchange Logic Error:', err);
        return NextResponse.json({
            success: false,
            error: err instanceof Error ? err.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
