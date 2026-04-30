import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createBlindIndex } from '@/lib/encryption';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { getAuthCookieOptions } from '@/lib/cookie';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const TOKEN_RE = /^[0-9a-f]{64}$/;

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`reset-pwd:${ip}`, 5, 60)) {
            return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });
        }

        const { token, newPassword } = await req.json();
        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
        }
        if (!TOKEN_RE.test(token)) {
            return NextResponse.json({ error: 'Reset link has expired or is invalid.' }, { status: 400 });
        }
        if (newPassword.length < 9 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return NextResponse.json({ error: 'Password must be at least 9 characters with uppercase, lowercase, and a number' }, { status: 400 });
        }

        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Find valid token
        const tokenResult = await query(
            `SELECT id, email FROM password_resets WHERE token_hash = $1 AND expires_at > NOW() AND (used = false OR used IS NULL) ORDER BY created_at DESC LIMIT 1`,
            [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
            return NextResponse.json({ error: 'Reset link has expired or is invalid.' }, { status: 400 });
        }

        const { id: resetId, email } = tokenResult.rows[0];
        const blindIndex = createBlindIndex(email);

        // Update password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        const userResult = await query(
            'UPDATE users SET password_hash = $1 WHERE email_blind_index = $2 RETURNING id',
            [passwordHash, blindIndex]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Mark token as used
        await query('UPDATE password_resets SET used = true WHERE id = $1', [resetId]);

        // Auto-login: set JWT cookie
        const userId = userResult.rows[0].id;
        if (JWT_SECRET) {
            const jwtToken = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '30d' });
            const response = NextResponse.json({ success: true, message: 'Password reset successfully.' });
            response.cookies.set('authToken', jwtToken, getAuthCookieOptions());
            return response;
        }

        return NextResponse.json({ success: true, message: 'Password reset successfully.' });
    } catch {
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
