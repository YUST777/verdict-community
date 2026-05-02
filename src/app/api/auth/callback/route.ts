import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const returnUrl = searchParams.get('returnUrl') ?? '/workspace';
    
    // Use the configured SITE_URL for redirects to avoid 0.0.0.0 issues behind proxy
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verdict.run';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.user?.email) {
            // Standard user sync logic...
            const email = data.user.email;
            const normalizedEmail = email.trim().toLowerCase();
            const blindIndex = createBlindIndex(normalizedEmail);
            const authId = data.user.id;

            try {
                const userResult = await query(
                    'SELECT id, auth_id FROM users WHERE email_blind_index = $1',
                    [blindIndex]
                );

                if (userResult.rows.length > 0) {
                    const updateFields = ['last_login_at = NOW()'];
                    const updateValues: any[] = [];
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
                    const encryptedEmail = encrypt(normalizedEmail);
                    await query(
                        `INSERT INTO users (email, email_blind_index, password_hash, auth_id, tier, is_verified, created_at, last_login_at)
                         VALUES ($1, $2, $3, $4, 'public', true, NOW(), NOW()) ON CONFLICT (email_blind_index) DO NOTHING`,
                        [encryptedEmail, blindIndex, 'oauth_user', authId]
                    );
                }
            } catch (dbError) {
                console.error('[Auth-Callback] DB Sync Error:', dbError);
                // We still have the auth session, so we can try to proceed
            }

            return NextResponse.redirect(new URL(returnUrl, baseUrl));
        } else {
            console.error('[Auth-Callback] Exchange failed:', {
                error: error?.message,
                status: error?.status,
                user: !!data?.user
            });
        }
    }

    // Return the user to an error page if something went wrong
    return NextResponse.redirect(new URL('/?error=auth_failed', baseUrl));
}
