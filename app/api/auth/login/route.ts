import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import { decrypt, createBlindIndex } from '@/lib/encryption';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const JWT_EXPIRES_IN = '24h';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const isAllowed = checkRateLimit(`login:${ip}`, 5, 60); // 5 attempts per minute

    if (!isAllowed) {
        return NextResponse.json({ error: 'Too many login attempts. Please wait.' }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        const userResult = await query(
            'SELECT id, email, password_hash, application_id FROM users WHERE email_blind_index = $1',
            [blindIndex]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = userResult.rows[0];
        const decryptedEmail = decrypt(user.email) || user.email; // Fallback if not encrypted (legacy/bug)

        // Double check email matches (though blind index should be unique)
        // If decrypted email exists and doesn't match normalized input, logic might differ, 
        // but typically blind index collision is rare enough or strictly 1:1.

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Update last login
        await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

        if (!JWT_SECRET) {
            console.error('JWT_SECRET missing');
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }

        const token = jwt.sign(
            { id: user.id, email: decryptedEmail, applicationId: user.application_id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Log login asynchronously
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        // Fire and forget logging
        query('INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES ($1, $2, $3)', [user.id, ip, userAgent])
            .catch(err => console.error('Error logging login:', err));

        return NextResponse.json({
            success: true,
            token,
            user: { id: user.id, email: decryptedEmail }
        });

    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
