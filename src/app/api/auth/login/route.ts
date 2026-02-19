import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createBlindIndex } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const JWT_EXPIRES_IN = '30d';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Find User
        const userResult = await query(
            'SELECT id, password_hash FROM public.users WHERE email_blind_index = $1',
            [blindIndex]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        const user = userResult.rows[0];

        // Verify Password
        if (!user.password_hash) {
            return NextResponse.json({ success: false, error: 'Invalid credentials (no password set)' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // Update Login Time
        await query('UPDATE public.users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        // Generate JWT
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET missing');
        }

        const token = jwt.sign(
            { id: user.id, email: normalizedEmail },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const response = NextResponse.json({ success: true, user: { id: user.id, email: normalizedEmail } });

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
        console.error('Login Error:', err);
        return NextResponse.json({
            success: false,
            error: err instanceof Error ? err.message : 'Login failed'
        }, { status: 500 });
    }
}
