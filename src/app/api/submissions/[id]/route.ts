import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const submissionId = parseInt(id);
        if (isNaN(submissionId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const result = await query(
            `SELECT * FROM training_submissions WHERE id = $1 AND user_id = $2`,
            [submissionId, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        const r = result.rows[0];
        return NextResponse.json({
            success: true,
            submission: {
                id: r.id,
                sheetId: r.sheet_id,
                problemId: r.problem_id,
                sourceCode: r.source_code,
                language: r.language || 'C++20 (GCC 13-64)',
                verdict: r.verdict,
                timeMs: r.time_ms,
                memoryKb: r.memory_kb,
                testsPassed: r.test_cases_passed,
                totalTests: r.total_test_cases,
                compileError: r.compile_error,
                runtimeError: r.runtime_error,
                submittedAt: r.submitted_at,
                attemptNumber: r.attempt_number,
                tabSwitches: r.tab_switches,
                pasteEvents: r.paste_events,
                timeToSolve: r.time_to_solve_seconds,
            },
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
