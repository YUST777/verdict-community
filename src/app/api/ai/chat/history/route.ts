import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const problemId = searchParams.get('problemId');

    // Return empty history (no chat log persisted)
    return NextResponse.json({ success: true, history: [] });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Mock save success
        return NextResponse.json({ success: true, message: 'Message saved (mock)' });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
}
