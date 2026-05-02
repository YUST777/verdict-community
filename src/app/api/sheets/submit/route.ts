import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { checkRateLimit } from '@/lib/simple-rate-limit';

const JUDGE0_API_URL = process.env.JUDGE0_URL || process.env.JUDGE0_API_URL;
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN;
const CPP_LANGUAGE_ID = 54;
const CPP_COMPILER_OPTIONS = '-std=c++17 -O2';

function compareOutputs(expected: string, actual: string): boolean {
    if (!expected && !actual) return true;
    if (!expected || !actual) return false;
    const tokensExp = expected.trim().split(/\s+/);
    const tokensAct = actual.trim().split(/\s+/);
    if (tokensExp.length !== tokensAct.length) return false;
    for (let i = 0; i < tokensExp.length; i++) {
        if (tokensExp[i].toLowerCase() === tokensAct[i].toLowerCase()) continue;
        try { if (BigInt(tokensExp[i]) === BigInt(tokensAct[i])) continue; return false; } catch {}
        const fE = parseFloat(tokensExp[i]), fA = parseFloat(tokensAct[i]);
        if (!isNaN(fE) && !isNaN(fA) && Math.abs(fE - fA) < 1e-5) continue;
        return false;
    }
    return true;
}

interface SubmitRequest {
    sheetId: string;
    problemId: string;
    sourceCode: string;
    tabSwitches?: number;
    pasteEvents?: number;
    timeToSolve?: number;
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!checkRateLimit(`judge_submit:${user.id}`, 10, 60)) {
            return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
        }

        const { sheetId, problemId, sourceCode, tabSwitches = 0, pasteEvents = 0, timeToSolve }: SubmitRequest = await req.json();

        if (!sheetId || !problemId || !sourceCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (sourceCode.length > 64 * 1024) {
            return NextResponse.json({ error: 'Source code too large (max 64KB)' }, { status: 400 });
        }
        if (!JUDGE0_API_URL) {
            return NextResponse.json({ error: 'Judge service not configured' }, { status: 503 });
        }

        // Get test cases from problem_test_cases table
        const tcResult = await query(
            'SELECT input, expected_output FROM problem_test_cases WHERE sheet_id = $1 AND problem_id = $2 ORDER BY ordinal',
            [sheetId, problemId]
        );
        const testCases = tcResult.rows;
        if (testCases.length === 0) {
            return NextResponse.json({ error: 'No test cases found' }, { status: 400 });
        }

        // Duplicate + attempt check
        const preCheck = await query(`
            SELECT
                (SELECT id FROM training_submissions WHERE user_id=$1 AND sheet_id=$2 AND problem_id=$3 AND MD5(TRIM(source_code))=MD5($4) LIMIT 1) AS dup_id,
                (SELECT COUNT(*) FROM training_submissions WHERE user_id=$1 AND sheet_id=$2 AND problem_id=$3) AS attempt_count
        `, [user.id, sheetId, problemId, sourceCode.trim()]);

        if (preCheck.rows[0].dup_id) {
            return NextResponse.json({ error: 'Duplicate submission' }, { status: 400 });
        }
        const attemptNumber = (parseInt(preCheck.rows[0].attempt_count) || 0) + 1;

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

        // Batch submit to Judge0
        const batchPayload = {
            submissions: testCases.map((tc: any) => ({
                source_code: Buffer.from(sourceCode).toString('base64'),
                language_id: CPP_LANGUAGE_ID,
                stdin: Buffer.from(tc.input).toString('base64'),
                expected_output: Buffer.from(tc.expected_output).toString('base64'),
                cpu_time_limit: 2,
                memory_limit: 256 * 1024,
                compiler_options: CPP_COMPILER_OPTIONS,
            }))
        };

        const batchRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(JUDGE0_AUTH_TOKEN && { 'X-Judge0-Token': JUDGE0_AUTH_TOKEN }) },
            body: JSON.stringify(batchPayload),
        });

        if (!batchRes.ok) return NextResponse.json({ error: 'Judge service unavailable' }, { status: 503 });

        const tokens = (await batchRes.json()).filter((t: any) => t.token);
        if (tokens.length === 0) return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });

        // Poll results
        const tokenStr = tokens.map((t: any) => t.token).join(',');
        let submissions: any[] = [];
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const res = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokenStr}&base64_encoded=true&fields=token,stdout,stderr,status_id,time,memory,compile_output`, {
                headers: { ...(JUDGE0_AUTH_TOKEN && { 'X-Judge0-Token': JUDGE0_AUTH_TOKEN }) },
            });
            if (!res.ok) continue;
            submissions = (await res.json()).submissions || [];
            if (submissions.every((s: any) => s.status_id >= 3)) break;
        }

        // Process results
        let allPassed = true, totalTimeMs = 0, maxMemoryKb = 0;
        const results = submissions.map((r: any, i: number) => {
            const stdout = r.stdout ? Buffer.from(r.stdout, 'base64').toString('utf-8').trim() : '';
            const stderr = r.stderr ? Buffer.from(r.stderr, 'base64').toString('utf-8') : '';
            const compileOut = r.compile_output ? Buffer.from(r.compile_output, 'base64').toString('utf-8') : '';
            if (r.time) totalTimeMs += parseFloat(r.time) * 1000;
            if (r.memory > maxMemoryKb) maxMemoryKb = r.memory;

            let verdict: string, passed = false;
            switch (r.status_id) {
                case 3: passed = compareOutputs(testCases[i].expected_output, stdout); verdict = passed ? 'Accepted' : 'Wrong Answer'; break;
                case 4: verdict = 'Wrong Answer'; break;
                case 5: verdict = 'Time Limit Exceeded'; break;
                case 6: verdict = 'Compilation Error'; break;
                case 7: case 8: case 9: case 10: case 11: case 12: verdict = 'Runtime Error'; break;
                default: verdict = 'Unknown';
            }
            if (!passed) allPassed = false;
            return { testCase: i + 1, verdict, passed, time: r.time ? `${r.time}s` : null, memory: r.memory ? `${Math.round(r.memory / 1024)}MB` : null, output: stdout, ...(verdict === 'Compilation Error' && { compileError: compileOut }), ...(verdict === 'Runtime Error' && { runtimeError: stderr }) };
        });

        const finalVerdict = allPassed ? 'Accepted' : results.find((r: any) => !r.passed)?.verdict || 'Unknown';
        const passedCount = results.filter((r: any) => r.passed).length;

        // Save with cheat tracking data
        const insertRes = await query(
            `INSERT INTO training_submissions (user_id, sheet_id, problem_id, source_code, verdict, time_ms, memory_kb, test_cases_passed, total_test_cases, compile_error, runtime_error, ip_address, tab_switches, paste_events, time_to_solve_seconds, attempt_number)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
            [user.id, sheetId, problemId, sourceCode, finalVerdict, Math.round(totalTimeMs), maxMemoryKb, passedCount, testCases.length, results.find((r: any) => r.compileError)?.compileError || null, results.find((r: any) => r.runtimeError)?.runtimeError || null, ip, tabSwitches, pasteEvents, timeToSolve || null, attemptNumber]
        );

        // If Accepted, update leaderboard cache
        if (allPassed) {
            try {
                // Check if this was already solved before
                const alreadySolved = await query(
                    "SELECT 1 FROM training_submissions WHERE user_id = $1 AND sheet_id = $2 AND problem_id = $3 AND verdict = 'Accepted' AND id != $4 LIMIT 1",
                    [user.id, sheetId, problemId, insertRes.rows[0].id]
                );

                if (alreadySolved.rows.length === 0) {
                    // Increment solved count in leaderboard_cache
                    await query(`
                        INSERT INTO leaderboard_cache (user_id, university_id, solved_count, last_solve_at)
                        SELECT u.id, u.university_id, 1, NOW()
                        FROM users u WHERE u.id = $1
                        ON CONFLICT (user_id) DO UPDATE SET
                            solved_count = leaderboard_cache.solved_count + 1,
                            last_solve_at = EXCLUDED.last_solve_at
                    `, [user.id]);

                    // Update university total solves
                    await query(`
                        UPDATE universities 
                        SET total_solves = total_solves + 1
                        WHERE id = (SELECT university_id FROM users WHERE id = $1)
                    `, [user.id]);

                    // Clear Redis cache for leaderboards
                    try {
                        const { default: redis } = await import('@/lib/redis');
                        const keys = await redis.keys('leaderboard:*');
                        if (keys.length > 0) await redis.del(...keys);
                    } catch (redisErr) {
                        console.error('Redis cache clear failed:', redisErr);
                    }
                }
            } catch (cacheErr) {
                console.error('Leaderboard cache update failed:', cacheErr);
            }
        }

        return NextResponse.json({ success: true, submissionId: insertRes.rows[0]?.id, verdict: finalVerdict, passed: allPassed, testsPassed: passedCount, totalTests: testCases.length, time: `${Math.round(totalTimeMs)}ms`, memory: `${Math.round(maxMemoryKb)}KB`, attemptNumber, results });
    } catch (error) {
        console.error('Sheet submit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
