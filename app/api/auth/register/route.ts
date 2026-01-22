import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import { encrypt, decrypt, createBlindIndex } from '@/lib/encryption';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const JWT_EXPIRES_IN = '24h';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const isAllowed = checkRateLimit(`register:${ip}`, 3, 3600); // 3 attempts per hour

    if (!isAllowed) {
        return NextResponse.json({ error: 'Too many registration attempts. Please wait.' }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return NextResponse.json({
                error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailBlindIndex = createBlindIndex(normalizedEmail);

        // Check if email exists in applications
        const appsResult = await query(
            'SELECT id, name, email FROM applications WHERE email_blind_index = $1',
            [emailBlindIndex]
        );

        if (appsResult.rows.length === 0) {
            return NextResponse.json({
                error: 'Email not found in applications. Please apply first.',
                redirect: '/apply'
            }, { status: 404 });
        }

        const application = appsResult.rows[0];

        let emailMatch = false;
        try {
            const decryptedAppEmail = decrypt(application.email);
            if (decryptedAppEmail && decryptedAppEmail.toLowerCase() === normalizedEmail) {
                emailMatch = true;
            }
        } catch (e) {
            console.error('Error decrypting app email:', e);
        }

        if (!emailMatch) {
            return NextResponse.json({
                error: 'Email not found in applications. Please apply first.',
                redirect: '/apply'
            }, { status: 404 });
        }

        // Check if user already exists
        // (Though the INSERT will fail on unique constraint, checking explicitly is nicer)
        // Actually, Express relied on catch(err.code === '23505'). We can do the same or check.
        // Let's rely on try/catch for atomicity.

        const passwordHash = await bcrypt.hash(password, 10);
        const encryptedEmail = encrypt(normalizedEmail);

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET missing');
        }

        const insertResult = await query(
            'INSERT INTO users (email, email_blind_index, password_hash, application_id) VALUES ($1, $2, $3, $4) RETURNING id, email, created_at',
            [encryptedEmail, emailBlindIndex, passwordHash, application.id]
        );

        const newUser = insertResult.rows[0];
        const token = jwt.sign(
            { id: newUser.id, email: normalizedEmail, applicationId: application.id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                email: normalizedEmail,
                name: application.name,
                applicationId: application.id
            }
        }, { status: 201 });

    } catch (error: unknown) {
        const err = error as { code?: string };
        if (err?.code === '23505') { // Unique violation
            return NextResponse.json({ error: 'Account already exists. Please login.' }, { status: 409 });
        }
        console.error('Register API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
