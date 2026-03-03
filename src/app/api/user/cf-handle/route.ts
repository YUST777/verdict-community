import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            'SELECT codeforces_handle FROM users WHERE id = $1',
            [user.id]
        );

        const handle = result.rows.length > 0 ? result.rows[0].codeforces_handle : null;
        return NextResponse.json({ success: true, handle: handle || null });
    } catch (error) {
        console.error('[CF Handle GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { handle } = body;

        if (typeof handle !== 'string' || handle.trim().length === 0) {
            return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
        }

        const trimmed = handle.trim();

        await query(
            'UPDATE users SET codeforces_handle = $1 WHERE id = $2',
            [trimmed, user.id]
        );

        return NextResponse.json({ success: true, handle: trimmed });
    } catch (error) {
        console.error('[CF Handle POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
