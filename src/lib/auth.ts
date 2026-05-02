import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';

export interface AuthUser {
    id: number;
    email: string;
    role?: string;
    auth_id?: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user || !user.email) {
            return null;
        }

        // Check if user exists in our public.users table
        const result = await query(
            'SELECT id, email, role, auth_id FROM users WHERE auth_id = $1 OR email = $2 LIMIT 1',
            [user.id, user.email]
        );

        if (result.rows.length > 0) {
            const dbUser = result.rows[0];

            // Auto-link auth_id if it's missing (legacy sync)
            if (!dbUser.auth_id && dbUser.email === user.email) {
                await query('UPDATE users SET auth_id = $1 WHERE id = $2', [user.id, dbUser.id]);
            }

            return {
                id: parseInt(dbUser.id),
                email: dbUser.email,
                role: dbUser.role || 'user',
                auth_id: user.id
            };
        }

        // If user is in Supabase but not in our table (e.g. newly registered via OAuth)
        // sync them now.
        const newRes = await query(
            `INSERT INTO users (email, password_hash, auth_id, is_email_verified, role, created_at, last_login_at) 
             VALUES ($1, 'supabase-managed', $2, true, 'user', NOW(), NOW()) 
             ON CONFLICT (email) DO UPDATE SET auth_id = EXCLUDED.auth_id, last_login_at = EXCLUDED.last_login_at 
             RETURNING id, email, role`,
            [user.email, user.id]
        );

        if (newRes.rows.length > 0) {
            const newUser = newRes.rows[0];
            return {
                id: parseInt(newUser.id),
                email: newUser.email,
                role: newUser.role || 'user',
                auth_id: user.id
            };
        }

    } catch (e) {
        console.error('[verifyAuth] Authentication error:', e instanceof Error ? e.message : 'Unknown error');
    }

    return null;
}
