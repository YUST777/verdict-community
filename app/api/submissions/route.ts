import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getSheet, getProblem } from '@/lib/problems';

export async function GET(req: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sheetId = searchParams.get('sheetId');
        const problemId = searchParams.get('problemId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = (page - 1) * limit;

        // Build query based on filters
        let queryText = `
            SELECT 
                ts.id,
                ts.sheet_id,
                ts.problem_id,
                ts.verdict,
                ts.time_ms,
                ts.memory_kb,
                ts.test_cases_passed,
                ts.total_test_cases,
                ts.submitted_at,
                ts.attempt_number,
                ts.language
            FROM training_submissions ts
            WHERE ts.user_id = $1
        `;
        const params: (string | number)[] = [user.id];
        let paramCount = 1;

        if (sheetId) {
            paramCount++;
            queryText += ` AND ts.sheet_id = $${paramCount}`;
            params.push(sheetId);
        }

        if (problemId) {
            paramCount++;
            queryText += ` AND ts.problem_id = $${paramCount}`;
            params.push(problemId);
        }

        // Get total count
        const countQuery = queryText.replace(
            /SELECT[\s\S]*?FROM/,
            'SELECT COUNT(*) as total FROM'
        );
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0]?.total || '0');

        // Add ordering and pagination
        queryText += ` ORDER BY ts.submitted_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);

        const result = await query(queryText, params);

        // Enrich with problem titles
        interface SubmissionRow {
            id: number;
            sheet_id: string;
            problem_id: string;
            verdict: string;
            time_ms: number;
            memory_kb: number;
            test_cases_passed: number;
            total_test_cases: number;
            submitted_at: string;
            attempt_number: number;
            language: string;
        }
        const submissions = result.rows.map((row: SubmissionRow) => {
            const problem = getProblem(row.sheet_id, row.problem_id);
            const sheet = getSheet(row.sheet_id);
            return {
                id: row.id,
                sheetId: row.sheet_id,
                sheetTitle: sheet?.title || row.sheet_id,
                problemId: row.problem_id,
                problemTitle: problem?.title || 'Unknown',
                verdict: row.verdict,
                timeMs: row.time_ms,
                memoryKb: row.memory_kb,
                testsPassed: row.test_cases_passed,
                totalTests: row.total_test_cases,
                submittedAt: row.submitted_at,
                attemptNumber: row.attempt_number,
                language: row.language || 'C++20 (GCC 13-64)',
            };
        });

        return NextResponse.json({
            success: true,
            submissions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
