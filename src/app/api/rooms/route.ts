import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/rooms - List all rooms or user's room
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const scope = searchParams.get('scope') || 'all'; // 'all' | 'my'

        // Get user's university
        const userResult = await query(
            'SELECT university_id, university_slug FROM users WHERE id = $1',
            [user.id]
        );
        const userUniversityId = userResult.rows[0]?.university_id;

        let roomsQuery: string;
        let params: any[] = [];

        if (scope === 'my' && userUniversityId) {
            // Get only user's university room
            roomsQuery = `
                SELECT 
                    r.id,
                    r.slug,
                    r.description,
                    r.banner_url,
                    r.is_active,
                    r.created_at,
                    u.id as university_id,
                    u.name as university_name,
                    u.short_name as university_short_name,
                    u.logo_url as university_logo,
                    u.member_count,
                    u.total_solves,
                    (SELECT COUNT(*) FROM room_announcements ra WHERE ra.room_id = r.id) as announcement_count
                FROM university_rooms r
                INNER JOIN universities u ON u.id = r.university_id
                WHERE r.university_id = $1 AND r.is_active = true
            `;
            params = [userUniversityId];
        } else {
            // Get all active rooms
            roomsQuery = `
                SELECT 
                    r.id,
                    r.slug,
                    r.description,
                    r.banner_url,
                    r.is_active,
                    r.created_at,
                    u.id as university_id,
                    u.name as university_name,
                    u.short_name as university_short_name,
                    u.logo_url as university_logo,
                    u.member_count,
                    u.total_solves,
                    (SELECT COUNT(*) FROM room_announcements ra WHERE ra.room_id = r.id) as announcement_count
                FROM university_rooms r
                INNER JOIN universities u ON u.id = r.university_id
                WHERE r.is_active = true
                ORDER BY u.member_count DESC, u.name ASC
            `;
        }

        const result = await query(roomsQuery, params);

        // If no rooms found, return empty
        if (result.rows.length === 0) {
            return NextResponse.json({
                rooms: [],
                userUniversityId,
            });
        }

        const rooms = result.rows.map((room: any) => ({
            id: room.id,
            slug: room.slug,
            description: room.description,
            bannerUrl: room.banner_url,
            isActive: room.is_active,
            createdAt: room.created_at,
            university: {
                id: room.university_id,
                name: room.university_name,
                shortName: room.university_short_name,
                logoUrl: room.university_logo,
                memberCount: parseInt(room.member_count) || 0,
                totalSolves: parseInt(room.total_solves) || 0,
            },
            announcementCount: parseInt(room.announcement_count) || 0,
        }));

        return NextResponse.json({ rooms, userUniversityId });
    } catch (error) {
        console.error('Rooms list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Sample data for development
function generateSampleRooms() {
    const universities = [
        { name: 'Cairo University', shortName: 'CU', members: 245, solves: 3420 },
        { name: 'Ain Shams University', shortName: 'ASU', members: 198, solves: 2890 },
        { name: 'Alexandria University', shortName: 'AU', members: 167, solves: 2340 },
        { name: 'Mansoura University', shortName: 'MU', members: 134, solves: 1920 },
        { name: 'Assiut University', shortName: 'AssiutU', members: 112, solves: 1650 },
        { name: 'Horus University', shortName: 'HUE', members: 89, solves: 1280 },
        { name: 'Suez Canal University', shortName: 'SCU', members: 76, solves: 980 },
        { name: 'Helwan University', shortName: 'HU', members: 65, solves: 870 },
        { name: 'Tanta University', shortName: 'TU', members: 54, solves: 720 },
        { name: 'Zagazig University', shortName: 'ZU', members: 48, solves: 640 },
    ];

    return universities.map((uni, index) => ({
        id: index + 1,
        slug: uni.shortName.toLowerCase(),
        description: `Official ICPC training room for ${uni.name}. Join fellow students and compete together!`,
        bannerUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        university: {
            id: index + 1,
            name: uni.name,
            shortName: uni.shortName,
            logoUrl: null,
            memberCount: uni.members,
            totalSolves: uni.solves,
        },
        announcementCount: Math.floor(Math.random() * 5),
    }));
}
