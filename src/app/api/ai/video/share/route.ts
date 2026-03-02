import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { script } = await req.json();
        if (!script || !script.scenes) {
            return NextResponse.json({ error: 'Invalid script data' }, { status: 400 });
        }

        // Ensure table exists
        await query(`
            CREATE TABLE IF NOT EXISTS public.video_shares (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                script JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
        `);

        // Insert script
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
