import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ levelSlug: string; sheetSlug: string; problemLetter: string }> }
) {
    try {
        const { levelSlug, sheetSlug, problemLetter } = await params;

        // Try DB (ICPCHUE schema with curriculum_problems + group_id on sheets)
        try {
            const result = await query(`
                SELECT 
                    p.id as problem_id,
                    p.problem_number,
                    p.problem_letter,
                    p.title as problem_title,
                    p.codeforces_url,
                    p.solution_video_url,
                    p.rating,
                    p.content,
                    s.id as sheet_id,
                    s.name as sheet_name,
                    s.contest_id,
                    s.contest_url,
                    l.slug as level_slug
                FROM curriculum_problems p
                JOIN curriculum_sheets s ON p.sheet_id = s.id
                JOIN curriculum_levels l ON s.level_id = l.id
                WHERE l.slug = $1 AND s.slug = $2 AND UPPER(p.problem_letter) = UPPER($3)
            `, [levelSlug, sheetSlug, problemLetter]);

            if (result.rows.length > 0) {
                const d = result.rows[0];
                const groupId = d.contest_url ? (d.contest_url.match(/group\/([^/]+)/)?.[1] || '') : '';
                return NextResponse.json({
                    success: true,
                    problem: {
                        id: d.problem_id,
                        letter: d.problem_letter,
                        number: d.problem_number,
                        title: d.problem_title,
                        codeforcesUrl: d.codeforces_url,
                        solutionVideoUrl: d.solution_video_url,
                        rating: d.rating,
                        sheetId: String(d.sheet_id),
                        contestId: d.contest_id,
                        groupId,
                        contestUrl: d.contest_url,
                        content: d.content,
                    },
                }, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } });
            }
        } catch { /* DB may not have the tables */ }

        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch curriculum problem' }, { status: 500 });
    }
}
