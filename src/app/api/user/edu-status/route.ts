import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status } = await req.json();
        if (!['pending', 'declined', 'verified'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Update the user's edu_eg_status in the DB
        await query(
            'UPDATE users SET edu_eg_status = $1 WHERE auth_id = $2',
            [status, user.id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API-Edu-Status] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
