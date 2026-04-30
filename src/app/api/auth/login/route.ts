import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query } from '@/lib/db';
import { createBlindIndex } from '@/lib/encryption';
import { getAuthCookieOptions } from '@/lib/cookie';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;
const JWT_EXPIRES_IN = '30d';

export async function POST(req: NextRequest) {
    try {
        // Rate limit login attempts to prevent brute-force attacks
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`login:${ip}`, 5, 60)) {
            return NextResponse.json({ success: false, error: 'Too many login attempts. Please try again later.' }, { status: 429 });
        }

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Find User
        const userResult = await query(
            'SELECT id, password_hash, university_id FROM public.users WHERE email_blind_index = $1',
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

        // Update Login Time + auto-detect university if missing
        const updateParts = ['last_login_at = NOW()'];
        const updateParams: any[] = [user.id];

        // Auto-link university from email domain if not set
        if (!user.university_id && normalizedEmail.endsWith('.edu.eg')) {
            try {
                const domain = normalizedEmail.split('@')[1];
                // Try exact match, then subdomain match (e.g. eng.cu.edu.eg -> cu.edu.eg)
                const parts = domain.split('.');
                const possibleDomains = [domain];
                if (parts.length > 3) possibleDomains.push(parts.slice(-3).join('.'));

                for (const d of possibleDomains) {
                    const uniRes = await query('SELECT id FROM universities WHERE email_domain = $1 AND is_active = true LIMIT 1', [d]);
                    if (uniRes.rows.length > 0) {
                        updateParts.push(`university_id = $${updateParams.length + 1}`);
                        updateParams.push(uniRes.rows[0].id);
                        break;
                    }
                }
            } catch { /* non-critical */ }
        }

        await query(`UPDATE public.users SET ${updateParts.join(', ')} WHERE id = $1`, updateParams);

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
        response.cookies.set('authToken', token, getAuthCookieOptions(req));

        return response;

    } catch (err) {
        console.error('Login Error:', err);
        return NextResponse.json({
            success: false,
            error: 'Login failed'
        }, { status: 500 });
    }
}
