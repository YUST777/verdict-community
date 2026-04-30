import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        // Find user by username
        const userResult = await query(`
            SELECT
                u.id,
                u.username,
                u.display_name,
                u.name,
                u.profile_picture,
                u.codeforces_handle,
                u.codeforces_data,
                u.university_id,
                u.faculty,
                u.created_at,
                u.show_public_profile,
                uni.name as university_name,
                uni.short_name as university_short_name,
                uni.slug as university_slug
            FROM users u
            LEFT JOIN universities uni ON uni.id = u.university_id
            WHERE u.username = $1
              AND (u.is_shadow_banned = false OR u.is_shadow_banned IS NULL)
            LIMIT 1
        `, [username.toLowerCase()]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        if (user.show_public_profile === false) {
            return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
        }

        // Get solve stats
        const statsResult = await query(`
            SELECT
                COUNT(DISTINCT (sheet_id, problem_id)) FILTER (WHERE verdict = 'Accepted' OR status = 'AC') as solved_count,
                COUNT(*) as total_submissions
            FROM training_submissions
            WHERE user_id = $1
        `, [user.id]);

        const stats = statsResult.rows[0] || { solved_count: 0, total_submissions: 0 };

        // Get achievements
        const achievementsResult = await query(`
            SELECT achievement_id, earned_at
            FROM user_achievements
            WHERE user_id = $1
            ORDER BY earned_at DESC
        `, [user.id]);

        // Get leaderboard position
        const rankResult = await query(`
            SELECT national_rank, university_rank, solved_count
            FROM leaderboard_cache
            WHERE user_id = $1
        `, [user.id]);

        const rank = rankResult.rows[0] || {};

        // Get streak
        const streakResult = await query(`
            SELECT current_streak, longest_streak
            FROM user_streaks
            WHERE user_id = $1
        `, [user.id]);

        const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

        // Decrypt display name if encrypted
        const displayName = user.display_name
            ? (decrypt(user.display_name) || user.display_name)
            : (user.name ? (decrypt(user.name) || user.name) : user.username);

        return NextResponse.json({
            success: true,
            profile: {
                username: user.username,
                displayName,
                profilePicture: user.profile_picture,
                codeforcesHandle: user.codeforces_handle,
                codeforcesData: user.codeforces_data,
                university: user.university_id ? {
                    name: user.university_name,
                    shortName: user.university_short_name,
                    slug: user.university_slug,
                } : null,
                faculty: user.faculty,
                joinedAt: user.created_at,
                stats: {
                    solvedCount: parseInt(stats.solved_count) || 0,
                    totalSubmissions: parseInt(stats.total_submissions) || 0,
                    currentStreak: parseInt(streak.current_streak) || 0,
                    longestStreak: parseInt(streak.longest_streak) || 0,
                    nationalRank: rank.national_rank || null,
                    universityRank: rank.university_rank || null,
                },
                achievements: achievementsResult.rows.map((a: any) => ({
                    id: a.achievement_id,
                    earnedAt: a.earned_at,
                })),
            },
        });
    } catch (error) {
        console.error('Public profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
