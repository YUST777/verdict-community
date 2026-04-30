import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const csrfToken = generateCSRFToken(String(user.id));

        const response = NextResponse.json({ csrfToken });
        response.cookies.set('csrf-token', csrfToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60,
            path: '/',
        });

        return response;
    } catch (error: unknown) {
        console.error('[CSRF API Error]', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

