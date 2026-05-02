import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query, icpchueQuery } from '@/lib/db';
import { createBlindIndex, decrypt } from '@/lib/encryption';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createClient as createSimpleClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`login:${ip}`, 50, 60)) {
            return NextResponse.json({ success: false, error: 'Too many login attempts.' }, { status: 429 });
        }

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        let normalizedEmail = email.trim().toLowerCase();
        
        // Handle lookup: if input doesn't look like an email, try to find the email by handle
        if (!normalizedEmail.includes('@')) {
            console.error(`[Login] Input ${normalizedEmail} is not an email. Searching for handle...`);
            // Check Verdict DB
            const localHandleRes = await query('SELECT email FROM public.users WHERE codeforces_handle = $1 LIMIT 1', [normalizedEmail]);
            if (localHandleRes.rows.length > 0) {
                normalizedEmail = decrypt(localHandleRes.rows[0].email) || localHandleRes.rows[0].email;
                console.error(`[Login] Found email ${normalizedEmail} for local handle ${body.email}`);
            } else {
                // Check HUE DB
                const hueHandleRes = await icpchueQuery('SELECT email FROM users WHERE codeforces_handle = $1 LIMIT 1', [normalizedEmail]);
                if (hueHandleRes.rows.length > 0) {
                    normalizedEmail = decrypt(hueHandleRes.rows[0].email, process.env.ICPCHUE_DB_ENCRYPTION_KEY) || hueHandleRes.rows[0].email;
                    console.error(`[Login] Found email ${normalizedEmail} for HUE handle ${body.email}`);
                }
            }
        }

        const supabase = await createClient();

        // 1. Primary Attempt: Verdict Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password,
        });

        if (authData?.user) {
            await query('UPDATE public.users SET last_login_at = NOW(), auth_id = $1 WHERE email = $2', [authData.user.id, normalizedEmail]);
            return NextResponse.json({ success: true, user: { id: authData.user.id, email: normalizedEmail } });
        }

        // 2. Secondary Attempt: Verdict DB (Legacy Bcrypt Migration)
        const blindIndex = createBlindIndex(normalizedEmail);
        let userResult = await query(
            'SELECT id, password_hash, university_id, auth_id FROM public.users WHERE email_blind_index = $1 OR email = $2 LIMIT 1',
            [blindIndex, normalizedEmail]
        );

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            if (user.password_hash && user.password_hash !== 'supabase-managed' && user.password_hash !== 'oauth_user') {
                const isMatch = await bcrypt.compare(password, user.password_hash);
                if (isMatch) {
                    const { data: newData, error: signUpError } = await supabase.auth.signUp({
                        email: normalizedEmail,
                        password: password,
                    });
                    if (newData?.user) {
                        await query('UPDATE public.users SET auth_id = $1, last_login_at = NOW(), password_hash = \'supabase-managed\' WHERE id = $2', [newData.user.id, user.id]);
                        return NextResponse.json({ success: true, user: { id: user.id, email: normalizedEmail } });
                    }
                }
            }
        }

        // 3. Tertiary Attempt: ICPC HUE Fallback (Cross-Project Migration)
        if (process.env.ICPCHUE_SUPABASE_URL && process.env.ICPCHUE_SUPABASE_ANON_KEY) {
            console.error(`[Login] Attempting HUE fallback for ${normalizedEmail}`);
            try {
                const icpchueSupabase = createSimpleClient(
                    process.env.ICPCHUE_SUPABASE_URL,
                    process.env.ICPCHUE_SUPABASE_ANON_KEY
                );

                const { data: hueData, error: hueError } = await icpchueSupabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password: password,
                });

                if (hueError) {
                    console.error(`[Login] HUE auth error: ${hueError.message}`);
                }

                if (hueData?.user) {
                    console.error(`[Login] HUE auth success for ${normalizedEmail}. Force-migrating to Verdict...`);
                    
                    const adminSupabase = await createAdminClient();
                    
                    // Try to get existing user first to avoid conflict error
                    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers();
                    let existingUser = usersData?.users.find(u => u.email?.toLowerCase() === normalizedEmail);
                    let targetAuthId = existingUser?.id;

                    if (targetAuthId) {
                        console.error(`[Login] User ${normalizedEmail} exists in Verdict. Updating and confirming...`);
                        await adminSupabase.auth.admin.updateUserById(targetAuthId, { 
                            password: password,
                            email_confirm: true 
                        });
                    } else {
                        console.error(`[Login] Creating new Verdict account for ${normalizedEmail}...`);
                        const { data: adminUser, error: adminError } = await adminSupabase.auth.admin.createUser({
                            email: normalizedEmail,
                            password: password,
                            email_confirm: true
                        });
                        targetAuthId = adminUser?.user?.id;
                        if (adminError) {
                            console.error(`[Login] Admin creation failed: ${adminError.message}`);
                        }
                    }

                    if (targetAuthId) {
                        // User exists/created in Verdict Auth. Now sync profile
                        const hueUserRes = await icpchueQuery(
                            'SELECT * FROM users WHERE email = $1 OR email_blind_index = $2 LIMIT 1',
                            [normalizedEmail, createBlindIndex(normalizedEmail)] 
                        );

                        let hueProfile = hueUserRes.rows[0];
                        if (!hueProfile) {
                            const allHueUsers = await icpchueQuery('SELECT id, email, codeforces_handle, telegram_username FROM users');
                            for (const row of allHueUsers.rows) {
                                const decrypted = decrypt(row.email, process.env.ICPCHUE_DB_ENCRYPTION_KEY);
                                if (decrypted?.toLowerCase() === normalizedEmail) {
                                    hueProfile = row;
                                    break;
                                }
                            }
                        }

                        if (hueProfile) {
                            console.error(`[Login] Migrating profile for ${normalizedEmail} from HUE DB`);
                            const checkRes = await query('SELECT id FROM public.users WHERE email = $1 LIMIT 1', [normalizedEmail]);
                            
                            if (checkRes.rows.length > 0) {
                                await query(
                                    `UPDATE public.users SET 
                                        auth_id = $1, 
                                        name = COALESCE(name, $2),
                                        codeforces_handle = COALESCE(codeforces_handle, $3),
                                        telegram_username = COALESCE(telegram_username, $4),
                                        university_id = 1,
                                        original_id = $5,
                                        last_login_at = NOW(),
                                        password_hash = 'supabase-managed'
                                    WHERE email = $6`,
                                    [targetAuthId, hueProfile.name || hueProfile.codeforces_handle || normalizedEmail.split('@')[0], hueProfile.codeforces_handle, hueProfile.telegram_username, hueProfile.id, normalizedEmail]
                                );
                            } else {
                                await query(
                                    `INSERT INTO public.users (
                                        email, auth_id, name, codeforces_handle, telegram_username, 
                                        university_id, original_id,
                                        tier, is_email_verified, created_at, last_login_at, password_hash, email_blind_index
                                    ) VALUES ($1, $2, $3, $4, $5, 1, $6, 'university', true, NOW(), NOW(), 'supabase-managed', $7)`,
                                    [normalizedEmail, targetAuthId, hueProfile.name || hueProfile.codeforces_handle || normalizedEmail.split('@')[0], hueProfile.codeforces_handle, hueProfile.telegram_username, hueProfile.id, createBlindIndex(normalizedEmail)]
                                );
                            }
                        }

                        // Now sign in the user for real to get the session
                        const { data: finalAuth, error: finalError } = await supabase.auth.signInWithPassword({
                            email: normalizedEmail,
                            password: password,
                        });

                        if (finalAuth?.user) {
                            return NextResponse.json({ success: true, user: { id: finalAuth.user.id, email: normalizedEmail } });
                        }
                    }
                }
            } catch (hueErr) {
                console.error('[Login] ICPC HUE fallback critical failure:', hueErr);
            }
        }

        return NextResponse.json({ success: false, error: authError?.message || 'Invalid credentials' }, { status: 401 });

    } catch (err) {
        console.error('Login Error:', err);
        return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
    }
}
