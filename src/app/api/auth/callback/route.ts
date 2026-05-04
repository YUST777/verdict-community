import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPool } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verdict.run';

    if (!code) {
        return NextResponse.redirect(new URL('/?error=no_code_provided', baseUrl));
    }

    console.log('[Auth-Callback] Final stable exchange starting...');
    const supabase = await createClient();
    
    try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[Auth-Callback] Exchange failed:', error.message);
            return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, baseUrl));
        }

        const user = data.user;
        const returnUrl = searchParams.get('returnUrl');
        
        let isValidReturnUrl = false;
        if (returnUrl) {
            try {
                const urlObj = new URL(returnUrl);
                if (urlObj.hostname === 'verdict.run' || urlObj.hostname.endsWith('.verdict.run') || urlObj.hostname === 'localhost') {
                    isValidReturnUrl = true;
                }
            } catch (e) {
                // ignore
            }
        }
        
        const finalRedirect = isValidReturnUrl 
            ? returnUrl!
            : new URL('/dashboard', baseUrl).toString();

        if (user?.email) {
            console.log('[Auth-Callback] Syncing user:', user.email);
            const pool = getPool();
            const client = await pool.connect();
            
            try {
                const normalizedEmail = user.email.trim().toLowerCase();
                const blindIndex = createBlindIndex(normalizedEmail);
                const authId = user.id;

                const res = await client.query(
                    'SELECT id FROM users WHERE email_blind_index = $1',
                    [blindIndex]
                );

                if (res.rows.length > 0) {
                    await client.query(
                        'UPDATE users SET auth_id = COALESCE(auth_id, $1), last_login_at = NOW() WHERE id = $2',
                        [authId, res.rows[0].id]
                    );
                } else {
                    const encryptedEmail = encrypt(normalizedEmail);
                    await client.query(
                        `INSERT INTO users (
                            email, email_blind_index, password_hash, auth_id, 
                            is_verified, edu_eg_status, created_at, last_login_at
                        ) VALUES ($1, $2, $3, $4, true, 'pending', NOW(), NOW())
                        ON CONFLICT (email_blind_index) WHERE email_blind_index IS NOT NULL DO NOTHING`,
                        [encryptedEmail, blindIndex, 'oauth_user', authId]
                    );
                }
            } catch (dbErr) {
                console.error('[Auth-Callback] DB Sync Error (internal):', dbErr);
            } finally {
                client.release();
            }

            // Check if the user already has a verified/declined edu status 
            // Only redirect to dashboard if they were going there anyway, otherwise let them go to returnUrl
            const pool2 = getPool();
            try {
                const statusRes = await pool2.query(
                    `SELECT edu_eg_status FROM users WHERE auth_id = $1`,
                    [user.id]
                );
                if (statusRes.rows.length > 0 && statusRes.rows[0].edu_eg_status !== 'pending') {
                    return NextResponse.redirect(finalRedirect);
                }
            } catch {}
        }

        return NextResponse.redirect(finalRedirect);

    } catch (err: any) {
        console.error('[Auth-Callback] Unexpected Error:', err);
        return NextResponse.redirect(new URL(`/?error=exception_${encodeURIComponent(err.message)}`, baseUrl));
    }
}
