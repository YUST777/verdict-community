import { NextResponse } from 'next/server';
import { executeSingleOnJudge0 } from '@/lib/judge';

export async function POST(request: Request) {
    try {
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
    } catch (error: any) {
        console.error('Judge Run API Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to execute code.' },
            { status: 500 }
        );
    }
}
