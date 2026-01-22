import { NextRequest, NextResponse } from 'next/server';
import { getSheet, getProblem, isProblemAvailable } from '@/lib/problems';
import { query } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sheetId } = await params;
        const sheet = getSheet(sheetId);

        if (!sheet) {
            return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
        }

        // Fetch solved counts from database
        const solvedCountsQuery = `
            SELECT problem_id, COUNT(DISTINCT user_id) as solved_count
            FROM training_submissions
            WHERE sheet_id = $1 AND verdict = 'Accepted'
            GROUP BY problem_id
        `;
        const solvedCountsResult = await query(solvedCountsQuery, [sheetId]);
        const solvedCountsMap = new Map<string, number>();

        solvedCountsResult.rows.forEach((row: { problem_id: string; solved_count: string }) => {
            solvedCountsMap.set(row.problem_id, parseInt(row.solved_count));
        });

        // Build problems list with availability status and solved count
        const problemsList = sheet.problems.map(problemId => {
            const problem = getProblem(sheetId, problemId);
            const available = isProblemAvailable(sheetId, problemId);

            return {
                id: problemId,
                title: available ? problem?.title : 'Coming Soon',
                available,
                timeLimit: problem?.timeLimit,
                memoryLimit: problem?.memoryLimit,
                solvedCount: solvedCountsMap.get(problemId) || 0
            };
        });

        // Add short cache to reduce DB load (30 seconds)
        // Solved counts don't need to be real-time
        return NextResponse.json({
            success: true,
            sheet: {
                id: sheet.id,
                title: sheet.title,
                description: sheet.description,
                totalProblems: sheet.totalProblems,
                problems: problemsList,
            }
        }, {
            headers: {
                'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
            }
        });
    } catch (error) {
        console.error('Error fetching sheet details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
