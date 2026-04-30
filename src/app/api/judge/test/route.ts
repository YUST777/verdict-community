import { NextRequest, NextResponse } from 'next/server';
import { executeBatchOnJudge0 } from '@/lib/judge';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        const rateLimitKey = user ? `judge-test:${user.id}` : `judge-test:${request.headers.get('x-forwarded-for') || 'anon'}`;
        if (!checkRateLimit(rateLimitKey, 20, 60)) {
            return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
        }

        const body = await request.json();
        const { sourceCode, language, testCases, timeLimit, memoryLimit } = body;

        if (!sourceCode || !language || !testCases || !Array.isArray(testCases)) {
            return NextResponse.json(
                { error: 'Missing required fields: sourceCode, language, and testCases are required.' },
                { status: 400 }
            );
        }

        const result = await executeBatchOnJudge0(
            sourceCode,
            language,
            testCases,
            timeLimit,
            memoryLimit
        );

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error('Judge Test API Error', error);
        return NextResponse.json(
            { error: 'Failed to execute test cases.' },
            { status: 500 }
        );
    }
}