import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const res = await query('SELECT id, name, short_name as "shortName" FROM universities ORDER BY name ASC');
        return NextResponse.json(res.rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
