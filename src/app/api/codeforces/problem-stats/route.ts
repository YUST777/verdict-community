import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const index = searchParams.get('index');

    if (!contestId || !index) {
        return NextResponse.json({ error: 'Missing contestId or index' }, { status: 400 });
    }

    // Mock response for now
    return NextResponse.json({
        solvedCount: 1234,
        difficulty: 1500,
        tags: ['dp', 'greedy'],
        acceptanceRate: 0.45
    });
}
