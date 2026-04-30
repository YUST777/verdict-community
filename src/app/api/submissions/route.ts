import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/submissions?contestId=X&problemIndex=Y
// Returns all submissions for the current user + problem
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ success: true, submissions: [] });
        }

        const contestId = req.nextUrl.searchParams.get('contestId');
        const problemIndex = req.nextUrl.searchParams.get('problemIndex');

        if (!contestId || !problemIndex) {
            return NextResponse.json({ error: 'Missing contestId or problemIndex' }, { status: 400 });
        }

        const result = await query(
            `SELECT id, cf_submission_id, source_code, language, verdict, time_ms, memory_kb,
                    passed_test_count, problem_rating, problem_tags, problem_name, created_at
             FROM submissions
             WHERE user_id = $1 AND contest_id = $2 AND problem_index = $3
             ORDER BY created_at DESC
             LIMIT 50`,
            [user.id, contestId, problemIndex.toUpperCase()]
        );

        const submissions = result.rows.map((row: any, idx: number) => ({
            id: row.cf_submission_id ? Number(row.cf_submission_id) : row.id,
            dbId: row.id,
            verdict: row.verdict,
            timeMs: row.time_ms || 0,
            memoryKb: row.memory_kb || 0,
            testsPassed: row.passed_test_count || 0,
            totalTests: row.verdict === 'Accepted'
                ? (row.passed_test_count || 0)
                : Math.max((row.passed_test_count || 0) + 1, 1),
            submittedAt: row.created_at,
            attemptNumber: result.rows.length - idx,
            sourceCode: row.source_code,
            language: row.language,
            problemRating: row.problem_rating,
            problemTags: row.problem_tags,
            problemName: row.problem_name,
        }));

        return NextResponse.json({ success: true, submissions });
    } catch (err) {
        console.error('[submissions GET]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// POST /api/submissions
// Save a new submission after CF verdict
export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            contestId, problemIndex, sourceCode, language,
            cfSubmissionId, verdict, timeMs, memoryKb,
            passedTestCount, problemRating, problemTags, problemName
        } = body;

        if (!contestId || !problemIndex || !sourceCode || !language || !verdict) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Dedup: skip if we already have this cf_submission_id
        if (cfSubmissionId) {
            const existing = await query(
                'SELECT id FROM submissions WHERE cf_submission_id = $1 AND user_id = $2 LIMIT 1',
                [cfSubmissionId, user.id]
            );
            if (existing.rows.length > 0) {
                return NextResponse.json({ success: true, duplicate: true, id: existing.rows[0].id });
            }
        }

        const result = await query(
            `INSERT INTO submissions (
                user_id, contest_id, problem_index, source_code, language,
                cf_submission_id, verdict, time_ms, memory_kb, passed_test_count,
                problem_rating, problem_tags, problem_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id`,
            [
                user.id,
                contestId,
                problemIndex.toUpperCase(),
                sourceCode,
                language,
                cfSubmissionId || null,
                verdict,
                timeMs || null,
                memoryKb || null,
                passedTestCount || null,
                problemRating || null,
                problemTags || null,
                problemName || null
            ]
        );

        return NextResponse.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('[submissions POST]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
