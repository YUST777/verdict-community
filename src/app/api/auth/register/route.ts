import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createBlindIndex, encrypt } from '@/lib/encryption';
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

        if (password.length < 6) {
            return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Check if user exists
        const existingUser = await query(
            'SELECT id FROM public.users WHERE email_blind_index = $1',
            [blindIndex]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 409 });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Encrypt Email
        const encryptedEmail = encrypt(normalizedEmail);

        // Insert User
        const newUserResult = await query(
            `INSERT INTO public.users (email, email_blind_index, password_hash, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING id`,
            [encryptedEmail, blindIndex, passwordHash]
        );

        if (newUserResult.rows.length === 0) {
            throw new Error('Failed to create user');
        }
        const userId = newUserResult.rows[0].id;

        // Generate JWT
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET missing');
        }

        const token = jwt.sign(
            { id: userId, email: normalizedEmail },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const response = NextResponse.json({ success: true, user: { id: userId, email: normalizedEmail } });

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
        console.error('Register Error:', err);
        return NextResponse.json({
            success: false,
            error: err instanceof Error ? err.message : 'Registration failed'
        }, { status: 500 });
    }
}
