import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import { icpchueQuery } from '@/lib/icpchue_db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authUser = await verifyAuth(req);
        if (!authUser) {
            return NextResponse.json({
                streak: 0,
                totalSolved: 0,
                consistencyMap: {},
                currentSheet: null
            });
        }
        const userId = authUser.id;

        // Fetch user basic info and stats
        const userResult = await query('SELECT email, university_id, original_id, stats FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];
        
        // Extract streak from stats JSONB
        const stats = user?.stats || {};
        const streak = stats.streak?.current || 0;

        // Fetch total solved problems from cache
        const solvedResult = await query(
            `SELECT solved_count as total 
             FROM public.leaderboard_cache 
             WHERE user_id = $1`,
            [userId]
        );
        let totalSolved = parseInt(solvedResult.rows[0]?.total) || 0;

        // Fetch activity for last 90 days
        const activityResult = await query(
             `SELECT DATE(submitted_at) as date, COUNT(*) as count
              FROM public.training_submissions
              WHERE user_id = $1 AND submitted_at >= NOW() - INTERVAL '90 days'
              GROUP BY DATE(submitted_at)`,
            [userId]
        );

        const consistencyMap: Record<string, number> = {};
        for (const row of activityResult.rows) {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            consistencyMap[dateStr] = parseInt(row.count);
        }

        // --- MERGE ICPC HUE DATA ---
        if (Number(user?.university_id) === 1 && user?.original_id) {
            try {
                const hueUserId = user.original_id;
                    
                    // Add HUE solves to total
                    const hueSolvedResult = await icpchueQuery(
                        `SELECT COUNT(DISTINCT problem_id) as total FROM public.user_progress WHERE user_id = $1 AND status = 'SOLVED'`,
                        [hueUserId]
                    );
                    // Note: We use a Set to avoid double counting if the user solved in both, 
                    // but for total count, we'll just sum or take the HUE one if it's larger.
                    // Ideally we should fetch all problem_ids and union them.
                    const hueTotal = parseInt(hueSolvedResult.rows[0]?.total) || 0;
                    totalSolved = Math.max(totalSolved, hueTotal); // Simple approach

                    // Add HUE activity to consistency map
                    const hueActivityResult = await icpchueQuery(
                        `SELECT DATE(submitted_at) as date, COUNT(*) as count
                         FROM public.submissions
                         WHERE user_id = $1 AND submitted_at >= NOW() - INTERVAL '90 days'
                         GROUP BY DATE(submitted_at)`,
                        [hueUserId]
                    );
                    for (const row of hueActivityResult.rows) {
                        const dateStr = new Date(row.date).toISOString().split('T')[0];
                        consistencyMap[dateStr] = (consistencyMap[dateStr] || 0) + parseInt(row.count);
                    }
            } catch (err) {
                console.error('HUE DB stats fetch failed:', err);
            }
        }

        // Fetch current/last active sheet (Verdict only)
        const sheetResult = await query(
            `SELECT 
                cs.id, cs.slug, cs.name, cs.sheet_letter,
                cl.slug as level_slug, cl.name as level_name,
                COALESCE(cs.total_problems, 0) as total_problems,
                (SELECT COUNT(DISTINCT ts.problem_id) 
                 FROM public.training_submissions ts 
                 WHERE ts.sheet_id = cs.id::text AND ts.user_id = $1 AND ts.verdict = 'AC') as solved_count,
                (SELECT MAX(ts.submitted_at) 
                 FROM public.training_submissions ts 
                 WHERE ts.sheet_id = cs.id::text AND ts.user_id = $1) as last_active
             FROM public.curriculum_sheets cs
             JOIN public.curriculum_levels cl ON cs.level_id = cl.id
             WHERE cs.is_active = true AND cs.id::text = (
                SELECT ts.sheet_id FROM public.training_submissions ts 
                WHERE ts.user_id = $1 ORDER BY ts.submitted_at DESC LIMIT 1
             )
             ORDER BY cs.id ASC
             LIMIT 1`,
            [userId]
        );

        let currentSheet = null;
        if (sheetResult.rows.length > 0) {
            const row = sheetResult.rows[0];
            currentSheet = {
                id: row.id,
                slug: row.slug,
                name: row.name,
                letter: row.sheet_letter,
                levelSlug: row.level_slug,
                levelName: row.level_name,
                totalProblems: parseInt(row.total_problems) || 0,
                solvedCount: parseInt(row.solved_count) || 0,
                lastActive: row.last_active
            };
        }

        return NextResponse.json({
            streak,
            totalSolved,
            consistencyMap,
            currentSheet
        });
    } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        return NextResponse.json({
            streak: 0,
            totalSolved: 0,
            consistencyMap: {},
            currentSheet: null
        });
    }
}
