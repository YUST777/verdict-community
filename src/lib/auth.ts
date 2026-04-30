import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
    id: number;
    email: string;
    userId?: number; // Legacy payload support
    role?: string;
    auth_id?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

interface LegacyJwtPayload extends JwtPayload {
    id?: string | number;
    userId?: string | number;
    email?: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
    try {
        // 1. Fast path: legacy JWT cookie auth (icpchue-style email/password flow)
        const token = req.cookies.get('authToken')?.value;
        if (token && JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as LegacyJwtPayload | string;
                if (typeof decoded !== 'string') {
                    const tokenUserId = Number(decoded.id ?? decoded.userId);
                    if (Number.isFinite(tokenUserId) && tokenUserId > 0) {
                        const userResult = await query(
                            'SELECT id, email, role, auth_id FROM users WHERE id = $1 LIMIT 1',
                            [tokenUserId]
                        );

                        if (userResult.rows.length > 0) {
                            const dbUser = userResult.rows[0];
                            return {
                                id: Number(dbUser.id),
                                email: typeof decoded.email === 'string' ? decoded.email : dbUser.email,
                                role: dbUser.role || 'user',
                                auth_id: dbUser.auth_id || undefined
                            };
                        }
                    }
                }
            } catch (jwtError) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[verifyAuth] JWT cookie verification failed:', jwtError instanceof Error ? jwtError.message : 'Unknown JWT error');
                }
            }
        }

        // 2. Supabase session fallback (OAuth / Supabase-managed users)
        // Only attempt if there are Supabase auth cookies present
        const hasSbCookies = req.cookies.getAll().some(c => c.name.includes('sb-') && c.name.includes('auth'));
        if (!hasSbCookies) return null;

        const supabase = await createClient();
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Supabase getUser timeout')), 2500);
        });

        let sbUser: { id: string; email?: string } | null = null;
        try {
            const { data: { user }, error: sbError } = await Promise.race([userPromise, timeoutPromise]);
            if (sbError && sbError.message !== 'Auth session missing!') {
                console.warn('[verifyAuth] Supabase getUser error:', sbError.message);
            }
            sbUser = user as { id: string; email?: string } | null;
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('[verifyAuth] Supabase session check skipped:', err instanceof Error ? err.message : 'unknown error');
            }
        }

        if (sbUser?.email) {
            const result = await query(
                'SELECT id, email, role, last_login_at as last_login, auth_id FROM users WHERE auth_id = $1 OR email = $2 LIMIT 1',
                [sbUser.id, sbUser.email]
            );

            if (result.rows.length > 0) {
                const legacyUser = result.rows[0];

                if (!legacyUser.auth_id && legacyUser.email === sbUser.email) {
                    await query('UPDATE users SET auth_id = $1 WHERE id = $2', [sbUser.id, legacyUser.id]);
                }

                return {
                    id: parseInt(legacyUser.id),
                    email: legacyUser.email,
                    role: legacyUser.role || 'user',
                    auth_id: sbUser.id
                };
            }

            const newRes = await query(
                'INSERT INTO users (email, password_hash, auth_id, is_verified, role, created_at, last_login_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET auth_id = EXCLUDED.auth_id, last_login_at = EXCLUDED.last_login_at RETURNING id, email, role',
                [sbUser.email, 'supabase-managed', sbUser.id, true, 'user']
            );

            if (newRes.rows.length > 0) {
                const newUser = newRes.rows[0];
                return {
                    id: parseInt(newUser.id),
                    email: newUser.email,
                    role: newUser.role || 'user',
                    auth_id: sbUser.id
                };
            }
        }

    } catch (e) {
        console.error('VERIFY ERROR:', e instanceof Error ? e.message : 'Unknown error');
    }


    return null;
}
