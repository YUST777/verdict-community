import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { createBlindIndex } from '@/lib/encryption';
import { query } from '@/lib/db';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import nodemailer from 'nodemailer';

const TOKEN_TTL_MS = 3600 * 1000; // 1 hour

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`forgot-pwd:${ip}`, 3, 900)) {
            return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
        }

        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const normalizedEmail = email.trim().toLowerCase();
        const blindIndex = createBlindIndex(normalizedEmail);

        // Check if user exists (don't reveal if they don't)
        const userResult = await query(
            'SELECT id FROM users WHERE email_blind_index = $1',
            [blindIndex]
        );

        // Always return success to prevent email enumeration
        const successResponse = { success: true, message: 'If an account exists with this email, a reset link has been sent.' };

        if (userResult.rows.length === 0) {
            await new Promise(r => setTimeout(r, 200)); // Timing attack mitigation
            return NextResponse.json(successResponse);
        }

        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

        // Store token hash in DB
        await query(
            `INSERT INTO password_resets (email, token_hash, expires_at) VALUES ($1, $2, $3)`,
            [normalizedEmail, tokenHash, expiresAt]
        );

        // Send email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
        const resetLink = `${siteUrl}/reset-password?token=${token}`;

        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_SERVER || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '25'),
                secure: false,
                auth: process.env.SMTP_LOGIN ? { user: process.env.SMTP_LOGIN, pass: process.env.SMTP_PASSWORD } : undefined,
            });

            await transporter.sendMail({
                from: `${process.env.SENDER_NAME || 'Verdict'} <${process.env.SENDER_EMAIL || 'noreply@verdict.run'}>`,
                to: normalizedEmail,
                subject: 'Reset your Verdict password',
                html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0a;color:#ddd;border-radius:12px;">
                    <h2 style="color:#10b981;margin:0 0 16px">Password Reset</h2>
                    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                    <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#10b981;color:#000;font-weight:bold;text-decoration:none;border-radius:8px;">Reset Password</a>
                    <p style="color:#666;font-size:12px;">If you didn't request this, ignore this email.</p>
                </div>`,
            });
        } catch {
            // Email send failed — still return success
        }

        return NextResponse.json(successResponse);
    } catch {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
