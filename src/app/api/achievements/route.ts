import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { icpchueQuery } from '@/lib/icpchue_db';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's university, email and stats
        const userBasicResult = await query('SELECT email, university_id, original_id, stats FROM users WHERE id = $1', [user.id]);
        const userBasic = userBasicResult.rows[0];

        // Fetch user's unlocked achievements
        const achievementsResult = await query(
            `SELECT id, achievement_id, earned_at, seen 
             FROM public.user_achievements 
             WHERE user_id = $1 
             ORDER BY earned_at DESC`,
            [user.id]
        );

        let achievements = achievementsResult.rows;

        // Fetch user's solved count from cache
        const statsResult = await query(
            `SELECT solved_count as problems_solved
             FROM public.leaderboard_cache
             WHERE user_id = $1`,
            [user.id]
        );

        let problemsSolved = parseInt(statsResult.rows[0]?.problems_solved) || 0;
        const currentStreak = parseInt(userBasic?.stats?.streak?.current) || 0;

        // --- MERGE ICPC HUE DATA ---
        if (Number(userBasic?.university_id) === 1 && userBasic?.original_id) {
            try {
                const hueUserId = userBasic.original_id;
                const hueSolvedResult = await icpchueQuery(
                    `SELECT COUNT(DISTINCT problem_id) as total FROM public.user_progress WHERE user_id = $1 AND status = 'SOLVED'`,
                    [hueUserId]
                );
                const hueTotal = parseInt(hueSolvedResult.rows[0]?.total) || 0;
                problemsSolved = Math.max(problemsSolved, hueTotal);
            } catch (err) {
                console.error('HUE DB achievements fetch failed:', err);
            }
        }

        // Build progress map for achievements
        const progress: Record<string, { current: number; total: number }> = {
            'first-solve': { current: Math.min(problemsSolved, 1), total: 1 },
            'streak-7': { current: Math.min(currentStreak, 7), total: 7 },
            'streak-30': { current: Math.min(currentStreak, 30), total: 30 },
            'problems-10': { current: Math.min(problemsSolved, 10), total: 10 },
            'problems-50': { current: Math.min(problemsSolved, 50), total: 50 },
            'problems-100': { current: Math.min(problemsSolved, 100), total: 100 },
            'problems-249': { current: Math.min(problemsSolved, 249), total: 249 },
        };

        // Auto-unlock achievements based on current progress
        const unlockedIds = new Set(achievements.map((a: any) => a.achievement_id));
        const toUnlock: string[] = [];

        // Check problem-based achievements
        if (problemsSolved >= 1 && !unlockedIds.has('first-solve')) toUnlock.push('first-solve');
        if (problemsSolved >= 10 && !unlockedIds.has('problems-10')) toUnlock.push('problems-10');
        if (problemsSolved >= 50 && !unlockedIds.has('problems-50')) toUnlock.push('problems-50');
        if (problemsSolved >= 100 && !unlockedIds.has('problems-100')) toUnlock.push('problems-100');
        if (problemsSolved >= 249 && !unlockedIds.has('problems-249')) toUnlock.push('problems-249');

        // Check streak-based achievements
        if (currentStreak >= 7 && !unlockedIds.has('streak-7')) toUnlock.push('streak-7');
        if (currentStreak >= 30 && !unlockedIds.has('streak-30')) toUnlock.push('streak-30');

        // Insert newly unlocked achievements
        if (toUnlock.length > 0) {
            for (const achievementId of toUnlock) {
                try {
                    await query(
                        `INSERT INTO public.user_achievements (user_id, achievement_id, earned_at, seen)
                         VALUES ($1, $2, NOW(), false)
                         ON CONFLICT (user_id, achievement_id) DO NOTHING`,
                        [user.id, achievementId]
                    );
                } catch (insertErr) {
                    console.warn('Failed to insert achievement:', achievementId, insertErr);
                }
            }

            const refreshed = await query(
                `SELECT id, achievement_id, earned_at, seen
                 FROM public.user_achievements
                 WHERE user_id = $1
                 ORDER BY earned_at DESC`,
                [user.id]
            );
            achievements = refreshed.rows;
        }

        return NextResponse.json({
            achievements,
            progress,
            stats: {
                problemsSolved,
                currentStreak,
            },
        });
    } catch (error) {
        console.error('Achievements error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Mark achievement as seen
export async function PATCH(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { achievementId } = body;

        if (!achievementId) {
            return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 });
        }

        if (typeof achievementId === 'number') {
            await query(
                `UPDATE public.user_achievements
                 SET seen = true
                 WHERE user_id = $1 AND id = $2`,
                [user.id, achievementId]
            );
        } else {
            await query(
                `UPDATE public.user_achievements
                 SET seen = true
                 WHERE user_id = $1 AND achievement_id = $2`,
                [user.id, achievementId]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Achievement PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
