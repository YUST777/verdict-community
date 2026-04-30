import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { curriculum, getProblemUrl } from '@/lib/curriculum';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sheetId: string }> }
) {
    try {
        const { sheetId } = await params;

        // 1. Try DB first (ICPCHUE schema with curriculum_problems)
        try {
            const sheetResult = await query(`
                SELECT s.id, s.sheet_letter, s.name, s.slug, s.description,
                       s.contest_id, s.contest_url, s.total_problems,
                       l.id as level_id, l.slug as level_slug, l.name as level_name
                FROM curriculum_sheets s
                JOIN curriculum_levels l ON s.level_id = l.id
                WHERE s.slug = $1 OR s.id::text = $1
            `, [sheetId]);

            if (sheetResult.rows.length > 0) {
                const s = sheetResult.rows[0];
                const groupId = s.contest_url ? (s.contest_url.match(/group\/([^/]+)/)?.[1] || '') : '';

                const problemsResult = await query(`
                    SELECT problem_number, problem_letter, title, codeforces_url
                    FROM curriculum_problems
                    WHERE sheet_id = $1
                    ORDER BY problem_number ASC
                `, [s.id]);

                return NextResponse.json({
                    success: true,
                    level: { id: s.level_id, slug: s.level_slug, name: s.level_name },
                    sheet: {
                        id: s.slug || s.id,
                        name: s.name,
                        title: s.name,
                        description: s.description,
                        contestId: s.contest_id,
                        groupId,
                        totalProblems: parseInt(s.total_problems) || 0,
                    },
                    problems: problemsResult.rows.map((p: any) => ({
                        number: p.problem_number,
                        letter: p.problem_letter,
                        title: p.title,
                        codeforcesUrl: p.codeforces_url,
                    })),
                });
            }
        } catch { /* DB may not have the tables */ }

        // 2. Fallback to static curriculum
        for (const level of curriculum) {
            const sheet = level.sheets.find(s => s.id === sheetId);
            if (sheet) {
                return NextResponse.json({
                    success: true,
                    level: { id: level.id, slug: level.slug, name: level.name },
                    sheet: {
                        id: sheet.id,
                        name: sheet.name,
                        title: sheet.title,
                        description: sheet.description,
                        contestId: sheet.contestId,
                        groupId: sheet.groupId,
                        totalProblems: sheet.problems.length,
                    },
                    problems: sheet.problems.map((letter, index) => ({
                        number: index + 1,
                        letter,
                        title: `Problem ${letter}`,
                        codeforcesUrl: getProblemUrl(sheet, letter),
                    })),
                });
            }
        }

        return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    } catch (error) {
        console.error('Failed to fetch problems:', error);
        return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }
}
