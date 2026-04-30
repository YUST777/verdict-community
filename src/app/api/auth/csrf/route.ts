import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const csrfToken = generateCSRFToken(user.id);

        const response = NextResponse.json({ csrfToken });

        // Also set as cookie for safety
        response.cookies.set('csrf-token', csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        });

        return response;
    } catch (error: unknown) {
        console.error('[CSRF API Error]', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal error' },
            { status: 500 }
        );
    }
}

