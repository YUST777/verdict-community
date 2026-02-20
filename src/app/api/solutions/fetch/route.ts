import { NextResponse } from 'next/server';
import { fetchAcceptedSolution } from '@/lib/solutions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contestId, problemIndex, language } = body;

        if (!contestId || !problemIndex) {
            return NextResponse.json(
                { error: 'contestId and problemIndex are required.' },
                { status: 400 }
            );
        }

        const result = await fetchAcceptedSolution(
            parseInt(contestId, 10),
            problemIndex.toUpperCase(),
            language
        );

        if (!result) {
            return NextResponse.json({ found: false, message: 'No archived accepted solution found.' });
        }

        return NextResponse.json({
            found: true,
            code: result.code,
            language: result.language,
            author: result.author
        });
    } catch (error: any) {
        console.error('Solutions fetch API error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch solution.' },
            { status: 500 }
        );
    }
}
