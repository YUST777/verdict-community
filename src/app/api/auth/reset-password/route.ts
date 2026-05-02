import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`reset-pwd:${ip}`, 5, 60)) {
            return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 });
        }

        const { newPassword } = await req.json();
        if (!newPassword) {
            return NextResponse.json({ error: 'New password required' }, { status: 400 });
        }

        // Basic password validation
        if (newPassword.length < 9 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return NextResponse.json({ error: 'Password must be at least 9 characters with uppercase, lowercase, and a number' }, { status: 400 });
        }

        const supabase = await createClient();

        // Update the user's password. 
        // Note: The user must have a valid session (from the reset email link) for this to work.
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('[reset-password] Supabase error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Password reset successfully.' });

    } catch (err) {
        console.error('[reset-password] Server error:', err);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
