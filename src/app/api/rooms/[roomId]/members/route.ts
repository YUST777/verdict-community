import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

// GET /api/rooms/[roomId]/members - Get room members with pagination
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomId } = await params;
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
        const offset = (page - 1) * limit;

        // Get room's university ID
        const isNumeric = /^\d+$/.test(roomId);
        const roomResult = await query(
            `SELECT r.id, r.university_id FROM university_rooms r 
             WHERE ${isNumeric ? 'r.id = $1' : 'r.slug = $1'}`,
            [roomId]
        );

        if (roomResult.rows.length === 0) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const universityId = roomResult.rows[0].university_id;

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as total FROM users 
             WHERE university_id = $1 AND is_shadow_banned = false`,
            [universityId]
        );
        const total = parseInt(countResult.rows[0]?.total || '0');

        // Get members with their stats
        const membersResult = await query(`
            SELECT 
                u.id,
                u.name,
                u.display_name,
                u.username,
                u.created_at,
                u.role,
                COALESCE(lc.solved_count, 0) as solved_count,
                COALESCE(lc.university_rank, 0) as university_rank,
                COALESCE(lc.national_rank, 0) as national_rank,
                us.current_streak,
                us.longest_streak
            FROM users u
            LEFT JOIN leaderboard_cache lc ON lc.user_id = u.id
            LEFT JOIN user_streaks us ON us.user_id = u.id
            WHERE u.university_id = $1 AND u.is_shadow_banned = false
            ORDER BY lc.solved_count DESC NULLS LAST, u.created_at ASC
            LIMIT $2 OFFSET $3
        `, [universityId, limit, offset]);

        const members = membersResult.rows.map((m: any) => {
            const rawName = m.display_name || m.name;
            const decryptedName = rawName ? (decrypt(rawName) || rawName) : (m.username || 'Anonymous');
            return {
                id: m.id,
                name: decryptedName,
                username: m.username,
                role: m.role || 'member',
                joinedAt: m.created_at,
                stats: {
                    solvedCount: parseInt(m.solved_count) || 0,
                    universityRank: parseInt(m.university_rank) || 0,
                    nationalRank: parseInt(m.national_rank) || 0,
                    currentStreak: parseInt(m.current_streak) || 0,
                    longestStreak: parseInt(m.longest_streak) || 0,
                },
            };
        });

        return NextResponse.json({
            members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: offset + members.length < total,
            },
        });
    } catch (error) {
        console.error('Room members error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
