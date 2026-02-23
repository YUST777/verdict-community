import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY || '';

export interface AuthUser {
    id: number;
    email: string;
    userId?: number; // Legacy payload support
    role?: string;
    auth_id?: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
    try {
        // 1. Check Supabase First
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.email) {
            // Find legacy user ID mapped to this Supabase auth session
            const result = await query(
                'SELECT id, email, role, auth_id FROM users WHERE auth_id = $1 OR email = $2 LIMIT 1',
                [session.user.id, session.user.email]
            );

            if (result.rows.length > 0) {
                const legacyUser = result.rows[0];

                // If they matched by email but don't have auth_id set, link them now
                if (!legacyUser.auth_id && legacyUser.email === session.user.email) {
                    await query('UPDATE users SET auth_id = $1 WHERE id = $2', [session.user.id, legacyUser.id]);
                }

                return {
                    id: parseInt(legacyUser.id),
                    email: legacyUser.email,
                    role: legacyUser.role || 'user',
                    auth_id: session.user.id
                };
            }

            // User doesn't exist in legacy DB at all, insert them to maintain structural integrity.
            // We use ON CONFLICT (email) DO UPDATE to prevent race conditions if multiple concurrent requests verify the user
            const newRes = await query(
                'INSERT INTO users (email, password_hash, auth_id, is_verified, role, created_at, last_login) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET auth_id = EXCLUDED.auth_id, last_login = EXCLUDED.last_login RETURNING id, email, role',
                [session.user.email, 'supabase-managed', session.user.id, true, 'user']
            );

            if (newRes.rows.length > 0) {
                const newUser = newRes.rows[0];
                return {
                    id: parseInt(newUser.id),
                    email: newUser.email,
                    role: newUser.role || 'user',
                    auth_id: session.user.id
                };
            }
        }

        // 2. Fallback to Legacy JWT token checking
        let token = req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            const cookie = req.cookies.get('authToken');
            if (cookie) token = cookie.value;
        }

        if (token && JWT_SECRET) {
            const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
            return {
                ...decoded,
                id: decoded.id || decoded.userId || 0
            };
        }

    } catch (e) {
        console.error('VERIFY ERROR:', e instanceof Error ? e.message : 'Unknown error');
    }

    return null;
}
