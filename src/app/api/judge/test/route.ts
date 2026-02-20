import { NextResponse } from 'next/server';
import { executeBatchOnJudge0 } from '@/lib/judge';

export async function POST(request: Request) {
    try {
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
    } catch (error: any) {
        console.error('Judge Test API Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to execute test cases.' },
            { status: 500 }
        );
    }
}
