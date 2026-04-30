import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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
        // Determine redirect path - OAuth users go to workspace by default
        let redirectPath = '/workspace';
        if (returnUrl) {
            try {
                const returnUrlObj = new URL(returnUrl);
                const baseUrlObj = new URL(baseUrl);
                if (returnUrlObj.hostname === baseUrlObj.hostname) {
                    redirectPath = returnUrlObj.pathname + returnUrlObj.search;
                }
            } catch { /* invalid URL */ }
        }

        // Create the redirect response FIRST so cookies can be set on it
        const response = NextResponse.redirect(new URL(redirectPath, baseUrl));

        // Create Supabase client using req.cookies directly
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return req.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data?.user || !data?.user?.email) {
            console.error('[Auth-Callback] Error:', error?.code || error);
            return NextResponse.redirect(new URL('/?error=auth_failed', baseUrl));
        }

        const email = data.user.email;
        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        const authId = data.user.id; // Supabase auth UUID
        
        const userResult = await query(
            'SELECT id, auth_id FROM users WHERE email_blind_index = $1',
            [blindIndex]
        );

        if (userResult.rows.length > 0) {
            // Update last_login and link auth_id if not already set
            const updateFields = ['last_login_at = NOW()'];
            const updateValues: (string | number)[] = [];
            let paramIndex = 1;
            
            if (!userResult.rows[0].auth_id) {
                updateFields.push(`auth_id = $${paramIndex++}`);
                updateValues.push(authId);
            }
            
            updateValues.push(userResult.rows[0].id);
            await query(
                `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
                updateValues
            );
        } else {
            // New OAuth user - create with 'public' tier (AI tutor and workspace access only)
            const encryptedEmail = encrypt(normalizedEmail);
            await query(
                `INSERT INTO users (email, email_blind_index, password_hash, auth_id, tier, is_verified, created_at, last_login_at)
                 VALUES ($1, $2, $3, $4, 'public', true, NOW(), NOW()) ON CONFLICT (email_blind_index) DO NOTHING`,
                [encryptedEmail, blindIndex, 'oauth_user', authId]
            );
        }

        return response;

    } catch (err) {
        console.error('[Auth-Callback] Error:', err);
        return NextResponse.redirect(new URL('/?error=processing_failed', baseUrl));
    }
}

// Also handle POST for sync from client-side auth
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        const userResult = await query(
            'SELECT id FROM users WHERE email_blind_index = $1',
            [blindIndex]
        );

        if (userResult.rows.length > 0) {
            await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userResult.rows[0].id]);
            return NextResponse.json({ success: true, userId: userResult.rows[0].id });
        } else {
            // New OAuth user - create with 'public' tier
            const encryptedEmail = encrypt(normalizedEmail);
            const newUserResult = await query(
                `INSERT INTO users (email, email_blind_index, password_hash, tier, created_at)
                 VALUES ($1, $2, $3, 'public', NOW())
                 ON CONFLICT (email_blind_index) DO UPDATE SET last_login_at = NOW()
                 RETURNING id`,
                [encryptedEmail, blindIndex, 'oauth_user']
            );
            return NextResponse.json({ success: true, userId: newUserResult.rows[0]?.id });
        }
    } catch (err) {
        console.error('[Auth-Callback-POST] Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
