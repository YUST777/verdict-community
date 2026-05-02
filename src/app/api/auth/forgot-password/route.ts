import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`forgot-pwd:${ip}`, 3, 900)) {
            return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
        }

        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const normalizedEmail = email.trim().toLowerCase();
        const supabase = await createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
        });

        if (error) {
            console.error('[forgot-password] Supabase error:', error.message);
            // Don't reveal error to user for security
        }

        return NextResponse.json({ 
            success: true, 
            message: 'If an account exists with this email, a reset link has been sent.' 
        });

    } catch (err) {
        console.error('[forgot-password] Server error:', err);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
