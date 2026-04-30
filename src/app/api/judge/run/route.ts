import { NextRequest, NextResponse } from 'next/server';
import { executeSingleOnJudge0 } from '@/lib/judge';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        const rateLimitKey = user ? `judge-run:${user.id}` : `judge-run:${request.headers.get('x-forwarded-for') || 'anon'}`;
        if (!checkRateLimit(rateLimitKey, 30, 60)) {
            return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const body = await request.json();
        const { code, language, stdin = '' } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Missing required field: code is required.' },
                { status: 400 }
            );
        }

        const result = await executeSingleOnJudge0(code, language || 'python', stdin);
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error('Judge Run API Error', error);
        return NextResponse.json(
            { error: 'Failed to execute code.' },
            { status: 500 }
        );
    }
}