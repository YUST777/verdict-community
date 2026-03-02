import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');
    const returnUrl = requestUrl.searchParams.get('returnUrl');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

    if (!code) {
        return NextResponse.redirect(new URL('/?error=no_code', baseUrl));
    }

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user || !data.user.email) {
            console.error('[Auth-Callback] Supabase Error:', error);
            return NextResponse.redirect(new URL('/?error=auth_failed', baseUrl));
        }

        const email = data.user.email;
        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Check if user exists in our local DB
        const userResult = await query(
            'SELECT id, email FROM users WHERE email_blind_index = $1',
            [blindIndex]
        );

        let userId: number;

        if (userResult.rows.length > 0) {
            // User exists, log them in
            const user = userResult.rows[0];
            userId = user.id;

            // Update last login
            await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);

        } else {
            // Register new user
            const encryptedEmail = encrypt(normalizedEmail);

            const newUserResult = await query(
                `INSERT INTO users (email, email_blind_index, password_hash, created_at)
                 VALUES ($1, $2, $3, NOW())
                 RETURNING id`,
                [encryptedEmail, blindIndex, 'oauth_user']
            );

            if (newUserResult.rows.length === 0) {
                throw new Error('Failed to create user');
            }
            userId = newUserResult.rows[0].id;
        }

        // Redirect to return URL or problemsets — same-origin only (no open redirect)
        let redirectPath = '/problemsets';

        if (returnUrl) {
            try {
                const returnUrlObj = new URL(returnUrl);
                const baseUrlObj = new URL(baseUrl);
                if (returnUrlObj.hostname === baseUrlObj.hostname) {
                    redirectPath = returnUrlObj.pathname + returnUrlObj.search;
                }
            } catch {
                // Invalid URL — ignore
            }
        }

        return NextResponse.redirect(new URL(redirectPath, baseUrl));

    } catch (err) {
        console.error('Callback Error:', err);
        return NextResponse.redirect(new URL('/?error=processing_failed', baseUrl));
    }
}
