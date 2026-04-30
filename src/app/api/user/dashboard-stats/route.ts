import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

        // Fetch user streak
        const streakResult = await query(
            `SELECT current_streak, longest_streak FROM public.user_streaks WHERE user_id = $1`,
            [userId]
        );
        const streak = streakResult.rows[0]?.current_streak || 0;

        // Fetch total solved problems
        const solvedResult = await query(
            `SELECT COUNT(DISTINCT problem_id) as total 
             FROM public.training_submissions 
             WHERE user_id = $1 AND verdict = 'AC'`,
            [userId]
        );
        const totalSolved = parseInt(solvedResult.rows[0]?.total) || 0;

        // Fetch activity for last 90 days (for consistency calendar)
        const activityResult = await query(
             `SELECT DATE(submitted_at) as date, COUNT(*) as count
              FROM public.training_submissions
              WHERE user_id = $1 AND submitted_at >= NOW() - INTERVAL '90 days'
              GROUP BY DATE(submitted_at)
             ORDER BY date DESC`,
            [userId]
        );

        const consistencyMap: Record<string, number> = {};
        for (const row of activityResult.rows) {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            consistencyMap[dateStr] = parseInt(row.count);
        }

        // Fetch current/last active sheet
        const sheetResult = await query(
            `SELECT 
                cs.id, cs.slug, cs.name, cs.letter,
                cl.slug as level_slug, cl.name as level_name,
                COALESCE(cs.total_problems, 0) as total_problems,
                (SELECT COUNT(DISTINCT ts.problem_id) 
                 FROM public.training_submissions ts 
                 WHERE ts.sheet_id = cs.id AND ts.user_id = $1 AND ts.verdict = 'AC') as solved_count,
                (SELECT MAX(ts.submitted_at) 
                 FROM public.training_submissions ts 
                 WHERE ts.sheet_id = cs.id AND ts.user_id = $1) as last_active
             FROM public.curriculum_sheets cs
             JOIN public.curriculum_levels cl ON cs.level_id = cl.id
             WHERE cs.is_active = true
             ORDER BY last_active DESC NULLS LAST
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
                letter: row.letter,
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
