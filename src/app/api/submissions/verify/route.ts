import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { contestId, problemIndex, cfHandle, sourceCode, language, sheetId, urlType, groupId } = body;

        if (!contestId || !problemIndex || !cfHandle) {
            return NextResponse.json({ error: 'Missing required fields: contestId, problemIndex, cfHandle' }, { status: 400 });
        }

        const trimmedHandle = cfHandle.trim();
        if (trimmedHandle.length === 0) {
            return NextResponse.json({ error: 'Handle cannot be empty' }, { status: 400 });
        }

        // 1. Fetch user status from Codeforces public API
        const cfUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(trimmedHandle)}&from=1&count=20`;
        
        let cfRes;
        try {
            cfRes = await fetch(cfUrl);
        } catch (fetchErr: any) {
            return NextResponse.json({ error: `Unable to reach Codeforces API. Please try again later. Details: ${fetchErr.message}` }, { status: 502 });
        }

        if (!cfRes.ok) {
            return NextResponse.json({ error: `Failed to fetch from Codeforces (Status ${cfRes.status}). Please make sure your Codeforces handle "${trimmedHandle}" is correct and public!` }, { status: 400 });
        }

        const cfData = await cfRes.json();
        if (cfData.status !== 'OK' || !Array.isArray(cfData.result)) {
            return NextResponse.json({ error: cfData.comment || 'Failed to fetch status from Codeforces.' }, { status: 400 });
        }

        // 2. Find matching Accepted submission
        const targetContestId = Number(contestId);
        const match = cfData.result.find((sub: any) => {
            const isContestMatch = Number(sub.contestId) === targetContestId;
            const isProblemMatch = sub.problem?.index?.toUpperCase() === problemIndex.toUpperCase();
            const isAccepted = sub.verdict === 'OK' || sub.verdict?.toUpperCase() === 'ACCEPTED';
            return isContestMatch && isProblemMatch && isAccepted;
        });

        if (!match) {
            return NextResponse.json({
                success: false,
                error: `No Accepted (AC) submission found on Codeforces for handle "${trimmedHandle}" and problem ${contestId}${problemIndex}. Please make sure you have submitted the code, it has passed all test cases, and your handle matches.`
            });
        }

        // 3. Save Codeforces handle to user profile in DB
        await query(
            'UPDATE users SET codeforces_handle = $1 WHERE id = $2',
            [trimmedHandle, user.id]
        );

        // 4. Save to cf_submissions
        const timeMs = match.timeConsumedMillis || 0;
        const memoryKb = Math.round((match.memoryConsumedBytes || 0) / 1024);

        const insertResult = await query(
            `INSERT INTO cf_submissions (
                user_id, contest_id, problem_index, source_code, language,
                cf_submission_id, verdict, time_ms, memory_kb, sheet_id, url_type, group_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (cf_submission_id) DO UPDATE SET
                verdict = EXCLUDED.verdict,
                time_ms = EXCLUDED.time_ms,
                memory_kb = EXCLUDED.memory_kb,
                source_code = EXCLUDED.source_code,
                language = EXCLUDED.language
            RETURNING id`,
            [
                user.id,
                contestId,
                problemIndex.toUpperCase(),
                sourceCode || '',
                language || 'C++',
                match.id,
                'Accepted',
                timeMs,
                memoryKb,
                sheetId || null,
                urlType || 'contest',
                groupId || null
            ]
        );

        // 5. Update user_progress
        const trackingProblemId = `${contestId}:${problemIndex.toUpperCase()}`;
        await query(
            `INSERT INTO user_progress (user_id, problem_id, sheet_id, status, submission_id, solved_at)
             VALUES ($1, $2, $3, 'SOLVED', $4, $5)
             ON CONFLICT (user_id, problem_id) 
             DO UPDATE SET 
                 status = 'SOLVED',
                 submission_id = EXCLUDED.submission_id,
                 solved_at = EXCLUDED.solved_at`,
            [
                user.id,
                trackingProblemId,
                sheetId || null,
                match.id,
                new Date()
            ]
        );

        return NextResponse.json({
            success: true,
            submissionId: match.id,
            timeMs,
            memoryKb
        });

    } catch (err: any) {
        console.error('[Verify Route Error]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
