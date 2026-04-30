import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ content: '' });

    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const problemIndex = searchParams.get('problemIndex');

    if (!checkRateLimit(`notes_view:${auth.id}`, 20, 60)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!contestId || !problemIndex) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const res = await query(
            'SELECT content FROM user_notes WHERE user_id = $1 AND contest_id = $2 AND problem_index = $3',
            [auth.id, contestId, problemIndex]
        );
        return NextResponse.json({ content: res.rows[0]?.content || '' });
    } catch (error) {
        console.error('Notes GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth) return NextResponse.json({ success: true, anonymous: true });

    try {
        const { contestId, problemIndex, content } = await request.json();

        if (!checkRateLimit(`notes_save:${auth.id}`, 20, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        if (!contestId || !problemIndex) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await query(
            `INSERT INTO user_notes (user_id, contest_id, problem_index, content, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id, contest_id, problem_index)
             DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
            [auth.id, contestId, problemIndex, content]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notes POST Error:', error);
        return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
    }
}
