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
            "SELECT settings->'tabs' as tabs FROM users WHERE id = $1",
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ data: [] });
        }

        return NextResponse.json({ data: result.rows[0].tabs || [] });
    } catch (error) {
        console.error('[User Tabs GET Error]', error);
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
        const { tabs } = body;

        if (!Array.isArray(tabs)) {
            return NextResponse.json({ error: 'Invalid tabs format. Expected an array.' }, { status: 400 });
        }

        await query(
            "UPDATE users SET settings = jsonb_set(settings, '{tabs}', $1::jsonb) WHERE id = $2",
            [JSON.stringify(tabs), user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[User Tabs POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
