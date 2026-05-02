import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

// GET /api/rooms/[roomId] - Get room details
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

        // Room can be accessed by ID or slug
        const isNumeric = /^\d+$/.test(roomId);

        const roomQuery = `
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
                u.email_domain,
                u.member_count,
                u.total_solves,
                u.type as university_type
            FROM university_rooms r
            INNER JOIN universities u ON u.id = r.university_id
            WHERE ${isNumeric ? 'r.id = $1' : 'r.slug = $1'}
        `;

        const roomResult = await query(roomQuery, [roomId]);

        if (roomResult.rows.length === 0) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const room = roomResult.rows[0];

        // Get announcements
        const announcementsResult = await query(`
            SELECT 
                a.id,
                a.title,
                a.body,
                a.pinned,
                a.created_at,
                u.name as author_name
            FROM room_announcements a
            LEFT JOIN users u ON u.id = a.author_id
            WHERE a.room_id = $1
            ORDER BY a.pinned DESC, a.created_at DESC
            LIMIT 10
        `, [room.id]);

        // Get top members (by solved problems)
        const topMembersResult = await query(`
            SELECT 
                u.id,
                u.name,
                u.display_name,
                u.username,
                u.email,
                u.student_id_encrypted,
                COALESCE(lc.solved_count, 0) as solved_count,
                lc.university_rank
            FROM users u
            LEFT JOIN leaderboard_cache lc ON lc.user_id = u.id
            WHERE u.university_id = $1 AND u.is_shadow_banned = false
            ORDER BY lc.solved_count DESC NULLS LAST
            LIMIT 10
        `, [room.university_id]);

        // Check if current user is a member of this university
        const userResult = await query(
            'SELECT university_id FROM users WHERE id = $1',
            [user.id]
        );
        const isMember = userResult.rows[0]?.university_id === room.university_id;

        return NextResponse.json({
            room: {
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
                    emailDomain: room.email_domain,
                    memberCount: parseInt(room.member_count) || 0,
                    totalSolves: parseInt(room.total_solves) || 0,
                    type: room.university_type,
                },
            },
            announcements: announcementsResult.rows.map((a: any) => ({
                id: a.id,
                title: a.title,
                body: a.body,
                pinned: a.pinned,
                createdAt: a.created_at,
                authorName: a.author_name,
            })),
            topMembers: topMembersResult.rows.map((m: any, index: number) => {
                const rawName = m.display_name || m.name;
                const decryptedName = rawName ? (decrypt(rawName) || rawName) : (m.username || 'Anonymous');
                
                // Fallback for identifier: username -> student_id -> email prefix
                let identifier = m.username;
                if (!identifier && m.student_id_encrypted) {
                    try { identifier = decrypt(m.student_id_encrypted); } catch {}
                }
                if (!identifier && m.email) {
                    try {
                        const decryptedEmail = decrypt(m.email) || m.email;
                        identifier = decryptedEmail.split('@')[0];
                    } catch {}
                }

                return {
                    id: m.id,
                    name: decryptedName,
                    username: identifier || 'trainee',
                    solvedCount: parseInt(m.solved_count) || 0,
                    rank: m.university_rank || index + 1,
                };
            }),
            isMember,
        });
    } catch (error) {
        console.error('Room details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Sample data generators for development
function generateSampleRoom(roomId: string) {
    return {
        id: 1,
        slug: roomId,
        description: 'Welcome to the official ICPC training room! Here you can find announcements, track your progress, and compete with fellow students.',
        bannerUrl: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        university: {
            id: 1,
            name: 'Horus University',
            shortName: 'HUE',
            logoUrl: null,
            emailDomain: 'horus.edu.eg',
            memberCount: 89,
            totalSolves: 1280,
            type: 'private',
        },
    };
}

function generateSampleAnnouncements() {
    return [
        {
            id: 1,
            title: 'Welcome to the Training Room!',
            body: 'This is the official ICPC training room for our university. Complete the training sheets to improve your competitive programming skills.',
            pinned: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            authorName: 'Coach Ahmed',
        },
        {
            id: 2,
            title: 'Weekly Contest This Friday',
            body: 'We will be hosting a practice contest this Friday at 8 PM. Make sure to register and join on time!',
            pinned: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            authorName: 'Coach Ahmed',
        },
        {
            id: 3,
            title: 'Level 1 Sheet Released',
            body: 'The new Level 1 training sheet is now available. It covers basic data structures and algorithms.',
            pinned: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            authorName: 'Coach Mohamed',
        },
    ];
}

function generateSampleMembers() {
    const names = ['Ahmed Hassan', 'Mohamed Ali', 'Omar Khaled', 'Youssef Ibrahim', 'Ali Mahmoud', 
                   'Khaled Salem', 'Hassan Nasser', 'Ibrahim Fathy', 'Mostafa Ahmed', 'Tarek Sayed'];
    
    return names.map((name, index) => ({
        id: index + 1,
        name,
        username: name.toLowerCase().replace(' ', '.'),
        solvedCount: Math.max(1, 100 - index * 8 - Math.floor(Math.random() * 5)),
        rank: index + 1,
    }));
}
