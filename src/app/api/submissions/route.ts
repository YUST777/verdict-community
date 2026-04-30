import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/submissions?contestId=X&problemIndex=Y
// or GET /api/submissions?sheetId=X&problemId=Y
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ success: true, submissions: [] });

        const contestId = req.nextUrl.searchParams.get('contestId');
        const problemIndex = req.nextUrl.searchParams.get('problemIndex') || req.nextUrl.searchParams.get('problemId');
        const sheetId = req.nextUrl.searchParams.get('sheetId');

        // CF submissions (contest-based)
        if (contestId && problemIndex) {
            const result = await query(
                `SELECT id, cf_submission_id, source_code, language, verdict, time_ms, memory_kb,
                        test_number, submitted_at
                 FROM cf_submissions
                 WHERE user_id = $1 AND contest_id = $2 AND problem_index = $3
                 ORDER BY submitted_at DESC
                 LIMIT 50`,
                [user.id, contestId, problemIndex.toUpperCase()]
            );

            return NextResponse.json({
                success: true,
                submissions: result.rows.map((r: any, idx: number) => ({
                    id: r.cf_submission_id ? Number(r.cf_submission_id) : r.id,
                    dbId: r.id,
                    verdict: r.verdict,
                    timeMs: r.time_ms || 0,
                    memoryKb: r.memory_kb || 0,
                    testsPassed: r.test_number || 0,
                    submittedAt: r.submitted_at,
                    attemptNumber: result.rows.length - idx,
                    sourceCode: r.source_code,
                    language: r.language,
                    source: 'codeforces',
                })),
            });
        }

        // Training submissions (sheet-based)
        if (sheetId) {
            const params: any[] = [user.id];
            let where = 'user_id = $1';
            if (sheetId) { where += ' AND sheet_id = $2'; params.push(sheetId); }
            if (problemIndex) { where += ` AND problem_id = $${params.length + 1}`; params.push(problemIndex); }

            const result = await query(
                `SELECT id, sheet_id, problem_id, source_code, language, verdict, time_ms, memory_kb,
                        test_cases_passed, total_test_cases, submitted_at, attempt_number,
                        tab_switches, paste_events, time_to_solve_seconds
                 FROM training_submissions
                 WHERE ${where}
                 ORDER BY submitted_at DESC
                 LIMIT 100`,
                params
            );

            return NextResponse.json({
                success: true,
                submissions: result.rows.map((r: any) => ({
                    id: r.id,
                    problemId: r.problem_id,
                    verdict: r.verdict,
                    timeMs: r.time_ms || 0,
                    memoryKb: r.memory_kb || 0,
                    testsPassed: r.test_cases_passed || 0,
                    totalTests: r.total_test_cases || 0,
                    submittedAt: r.submitted_at,
                    attemptNumber: r.attempt_number,
                    language: r.language,
                    source: 'judge0',
                })),
            });
        }

        return NextResponse.json({ error: 'Missing contestId or sheetId' }, { status: 400 });
    } catch (err) {
        console.error('[submissions GET]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// POST /api/submissions — Save CF submission
export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { contestId, problemIndex, sourceCode, language, cfSubmissionId, verdict, timeMs, memoryKb, sheetId, urlType, groupId } = body;

        if (!contestId || !problemIndex || !verdict) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Dedup
        if (cfSubmissionId) {
            const existing = await query(
                'SELECT id FROM cf_submissions WHERE cf_submission_id = $1 AND user_id = $2 LIMIT 1',
                [cfSubmissionId, user.id]
            );
            if (existing.rows.length > 0) {
                return NextResponse.json({ success: true, duplicate: true, id: existing.rows[0].id });
            }
        }

        const result = await query(
            `INSERT INTO cf_submissions (
                user_id, contest_id, problem_index, source_code, language,
                cf_submission_id, verdict, time_ms, memory_kb, sheet_id, url_type, group_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [user.id, contestId, problemIndex.toUpperCase(), sourceCode || '', language || 'C++', cfSubmissionId || null, verdict, timeMs || null, memoryKb || null, sheetId || null, urlType || 'contest', groupId || null]
        );

        return NextResponse.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('[submissions POST]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
