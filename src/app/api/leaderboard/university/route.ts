import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getCachedData, setCachedData } from '@/lib/redis';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const scope = searchParams.get('scope') || 'national'; // 'national' | 'university' | 'universities'
        const universityId = searchParams.get('universityId');

        const cacheKey = `leaderboard:${scope}:${universityId || 'all'}`;
        const cached = await getCachedData<any>(cacheKey);
        if (cached) return NextResponse.json(cached);

        let responseData: any = null;

        if (scope === 'universities') {
            // ... (universities logic) ...
            const result = await query(`
                SELECT
                    u.id,
                    u.name,
                    u.short_name,
                    u.slug,
                    u.type,
                    u.logo_url,
                    u.member_count,
                    u.total_solves,
                    COALESCE(lc.active_solvers, 0) as active_solvers
                FROM universities u
                LEFT JOIN (
                    SELECT university_id, COUNT(DISTINCT user_id) as active_solvers
                    FROM leaderboard_cache
                    WHERE solved_count > 0
                    GROUP BY university_id
                ) lc ON u.id = lc.university_id
                WHERE u.is_active = true AND u.member_count > 0
                ORDER BY u.total_solves DESC, u.member_count DESC
            `);

            responseData = {
                success: true,
                scope: 'universities',
                rankings: result.rows.map((r: any, i: number) => ({
                    rank: i + 1,
                    id: r.id,
                    name: r.name,
                    shortName: r.short_name,
                    slug: r.slug,
                    type: r.type,
                    logoUrl: r.logo_url,
                    memberCount: parseInt(r.member_count) || 0,
                    totalSolves: parseInt(r.total_solves) || 0,
                    activeSolvers: parseInt(r.active_solvers) || 0,
                })),
            };
        } else if (scope === 'university' && universityId) {
            // ... (university logic) ...
            const result = await query(`
                SELECT
                    u.id as user_id,
                    u.username,
                    u.display_name,
                    u.name,
                    u.email,
                    u.student_id_encrypted,
                    u.codeforces_handle,
                    u.profile_picture,
                    lc.solved_count,
                    lc.university_rank,
                    lc.last_solve_at,
                    u.cheating_flags
                FROM leaderboard_cache lc
                INNER JOIN users u ON u.id = lc.user_id
                WHERE lc.university_id = $1
                  AND (u.is_shadow_banned = false OR u.is_shadow_banned IS NULL)
                  AND (u.show_on_leaderboard = true OR u.show_on_leaderboard IS NULL)
                ORDER BY lc.solved_count DESC, lc.last_solve_at ASC
                LIMIT 100
            `, [universityId]);

            const uniResult = await query(
                'SELECT name, short_name, slug FROM universities WHERE id = $1',
                [universityId]
            );
            const uni = uniResult.rows[0];

            responseData = {
                success: true,
                scope: 'university',
                university: uni ? { name: uni.name, shortName: uni.short_name, slug: uni.slug } : null,
                leaderboard: result.rows.map((r: any, i: number) => {
                    const rawName = r.display_name || r.name;
                    const decryptedName = rawName ? (decrypt(rawName) || rawName) : (r.username || 'Anonymous');
                    
                    let identifier = r.username;
                    if (!identifier && r.student_id_encrypted) {
                        try { identifier = decrypt(r.student_id_encrypted); } catch {}
                    }
                    if (!identifier && r.email) {
                        try {
                            const decryptedEmail = decrypt(r.email) || r.email;
                            identifier = decryptedEmail.split('@')[0];
                        } catch {}
                    }

                    return {
                        rank: i + 1,
                        userId: parseInt(r.user_id),
                        username: decryptedName,
                        handle: identifier || 'trainee',
                        codeforcesHandle: r.codeforces_handle,
                        profilePicture: r.profile_picture,
                        solvedCount: parseInt(r.solved_count) || 0,
                        lastSolveAt: r.last_solve_at,
                        cheatingFlags: parseInt(r.cheating_flags) || 0,
                    };
                }),
            };
        } else {
            // National leaderboard
            const result = await query(`
                SELECT
                    u.id as user_id,
                    u.username,
                    u.display_name,
                    u.name,
                    u.codeforces_handle,
                    u.profile_picture,
                    uni.short_name as university_short_name,
                    uni.slug as university_slug,
                    lc.solved_count,
                    lc.national_rank,
                    lc.last_solve_at,
                    u.cheating_flags
                FROM leaderboard_cache lc
                INNER JOIN users u ON u.id = lc.user_id
                LEFT JOIN universities uni ON uni.id = lc.university_id
                WHERE (u.is_shadow_banned = false OR u.is_shadow_banned IS NULL)
                  AND (u.show_on_leaderboard = true OR u.show_on_leaderboard IS NULL)
                ORDER BY lc.solved_count DESC, lc.last_solve_at ASC
                LIMIT 100
            `);

            responseData = {
                success: true,
                scope: 'national',
                leaderboard: result.rows.map((r: any, i: number) => {
                    const rawName = r.display_name || r.name;
                    const decryptedName = rawName ? (decrypt(rawName) || rawName) : (r.username || 'Anonymous');
                    return {
                        rank: i + 1,
                        userId: parseInt(r.user_id),
                        username: decryptedName,
                        codeforcesHandle: r.codeforces_handle,
                        profilePicture: r.profile_picture,
                        universityShortName: r.university_short_name,
                        universitySlug: r.university_slug,
                        solvedCount: parseInt(r.solved_count) || 0,
                        lastSolveAt: r.last_solve_at,
                        cheatingFlags: parseInt(r.cheating_flags) || 0,
                    };
                }),
            };
        }

        if (responseData) {
            await setCachedData(cacheKey, responseData, 300); // 5 minute cache
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('University leaderboard error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
