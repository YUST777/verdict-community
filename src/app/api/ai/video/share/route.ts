import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export async function POST(req: NextRequest) {
    try {
        // Auth required
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit: 10 shares per minute per user
        if (!checkRateLimit(`video-share:${user.id}`, 10, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { script } = await req.json();
        if (!script || !script.scenes) {
            return NextResponse.json({ error: 'Invalid script data' }, { status: 400 });
        }

        // Insert script (table should already exist via migration)
        const result = await query(
            'INSERT INTO public.video_shares (script) VALUES ($1) RETURNING id',
            [JSON.stringify(script)]
        );

        const id = result.rows[0].id;

        return NextResponse.json({ id, url: `/video/${id}` });
    } catch (error: unknown) {
        console.error('[Video Share Error]', error);
        return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }
}