import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const contestId = req.nextUrl.searchParams.get('contestId');
    if (!contestId) {
        return NextResponse.json({ error: 'contestId is required' }, { status: 400 });
    }

    try {
        const cfRes = await fetch(
            `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`,
            { next: { revalidate: 300 } } // cache for 5 minutes
        );
        const data = await cfRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[CF Contest Problems Error]', error);
        return NextResponse.json(
            { status: 'FAILED', comment: 'Failed to fetch from Codeforces' },
            { status: 502 }
        );
    }
}
