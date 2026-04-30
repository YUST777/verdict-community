import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/rooms/public - Public rooms listing (no auth required)
export async function GET() {
    try {
        const result = await query(`
            SELECT
                r.id,
                r.slug,
                u.id as university_id,
                u.name as university_name,
                u.short_name as university_short_name,
                u.type as university_type,
                u.logo_url as university_logo,
                u.member_count,
                u.total_solves
            FROM university_rooms r
            INNER JOIN universities u ON u.id = r.university_id
            WHERE r.is_active = true AND u.is_active = true
            ORDER BY u.member_count DESC, u.name ASC
        `);

        const rooms = result.rows.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            university: {
                id: r.university_id,
                name: r.university_name,
                shortName: r.university_short_name,
                type: r.university_type,
                logoUrl: r.university_logo,
                memberCount: parseInt(r.member_count) || 0,
                totalSolves: parseInt(r.total_solves) || 0,
            },
        }));

        return NextResponse.json({ rooms });
    } catch (error) {
        console.error('Public rooms error:', error);
        return NextResponse.json({ rooms: [] }, { status: 500 });
    }
}
