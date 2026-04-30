import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { curriculum, getLevel } from '@/lib/curriculum';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ levelSlug: string }> }
) {
    try {
        const { levelSlug } = await params;

        // Get user ID from token (optional — guest gets no progress)
        let userId: number | null = null;
        const token = req.cookies.get('authToken')?.value;
        if (token && JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as { id: string | number };
                userId = Number(decoded.id);
            } catch { /* guest */ }
        }

        // Try DB first (ICPCHUE schema: curriculum_levels + curriculum_sheets + curriculum_problems)
        try {
            const levelResult = await query(
                `SELECT id, level_number, name, slug, description, duration_weeks, total_problems
                 FROM curriculum_levels WHERE slug = $1`,
                [levelSlug]
            );

            if (levelResult.rows.length > 0) {
                const lvl = levelResult.rows[0];

                // Get sheets with problem counts from DB
                const sheetsResult = await query(`
                    SELECT 
                        s.id, s.sheet_letter, s.sheet_number, s.name, s.slug,
                        s.description, s.contest_id, s.contest_url, s.total_problems
                    FROM curriculum_sheets s
                    WHERE s.level_id = $1
                    ORDER BY s.sheet_number ASC
                `, [lvl.id]);

                // Get per-sheet solved counts if user is logged in
                const solvedMap: Record<string, number> = {};
                if (userId) {
                    try {
                        // Check training_submissions for solved problems
                        const solvedResult = await query(`
                            SELECT ts.sheet_id, COUNT(DISTINCT ts.problem_id) as solved
                            FROM training_submissions ts
                            WHERE ts.user_id = $1 AND (ts.verdict = 'Accepted' OR ts.status = 'AC')
                            GROUP BY ts.sheet_id
                        `, [userId]);
                        for (const row of solvedResult.rows) {
                            solvedMap[row.sheet_id] = parseInt(row.solved) || 0;
                        }
                    } catch { /* table may not exist */ }
                }

                return NextResponse.json({
                    success: true,
                    level: {
                        id: lvl.id,
                        slug: lvl.slug,
                        name: lvl.name,
                        title: lvl.name.replace(/^Level \d+: /, ''),
                        description: lvl.description,
                        durationWeeks: lvl.duration_weeks,
                        totalProblems: lvl.total_problems,
                    },
                    sheets: sheetsResult.rows.map((s: any, index: number) => ({
                        id: s.slug || s.id,
                        letter: s.sheet_letter,
                        number: s.sheet_number,
                        name: s.name,
                        title: s.name,
                        description: s.description,
                        contestId: s.contest_id,
                        contestUrl: s.contest_url,
                        groupId: s.contest_url ? s.contest_url.match(/group\/([^/]+)/)?.[1] || '' : '',
                        totalProblems: parseInt(s.total_problems) || 0,
                        solvedCount: solvedMap[s.slug] || solvedMap[String(s.id)] || 0,
                    })),
                });
            }
        } catch (dbErr) {
            console.warn('DB curriculum fetch failed, falling back to static:', dbErr);
        }

        // Fallback to static curriculum data
        const level = getLevel(levelSlug);
        if (!level) {
            return NextResponse.json({ error: 'Level not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            level: {
                id: level.id,
                slug: level.slug,
                name: level.name,
                title: level.title,
                description: level.description,
                durationWeeks: level.durationWeeks,
                totalProblems: level.totalProblems,
            },
            sheets: level.sheets.map((sheet, index) => ({
                id: sheet.id,
                letter: sheet.id.replace('sheet-', '').toUpperCase(),
                number: index + 1,
                name: sheet.name,
                title: sheet.title,
                description: sheet.description,
                contestId: sheet.contestId,
                groupId: sheet.groupId,
                totalProblems: sheet.problems.length,
                solvedCount: 0,
            })),
        });
    } catch (error) {
        console.error('Failed to fetch sheets:', error);
        return NextResponse.json({ error: 'Failed to fetch sheets' }, { status: 500 });
    }
}
