import { NextRequest, NextResponse } from 'next/server';
import { Judge0Token, Judge0SubmissionResult } from '@/lib/types';
import { z } from 'zod';

// Self-hosted Judge0 Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN;

// Server-side validation schema (defense-in-depth)
const RequestSchema = z.object({
    sourceCode: z.string().min(1).max(500000), // 500KB max source code
    language: z.string().max(20).optional().default('cpp'),
    testCases: z.array(z.object({
        input: z.string().max(100000),  // 100KB max per test input
        output: z.string().max(100000)  // 100KB max per test output
    })).min(1).max(50), // 1-50 test cases
    timeLimit: z.number().min(100).max(10000).optional().default(2000),
    memoryLimit: z.number().min(16).max(1024).optional().default(256)
});

const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
    'cpp': 54,        // C++ (GCC 9.2.0)
    'cpp17': 54,
    'java': 62,       // Java (OpenJDK 13.0.1)
    'python': 71,     // Python (3.8.1)
    'python3': 71,
    'javascript': 63, // JavaScript (Node.js 12.14.0)
    'node': 63,
    'csharp': 51,     // C# (Mono 6.6.0.161)
    'kotlin': 78,     // Kotlin (1.3.70)
    'go': 60,         // Go (1.13.5)
    'rust': 73,       // Rust (1.40.0)
};

// TestRequest interface is defined by RequestSchema above via Zod
// Keeping for documentation purposes
// interface TestRequest {
//     sourceCode: string;
//     language?: string;
//     testCases: { input: string; output: string }[];
//     timeLimit?: number; // ms
//     memoryLimit?: number; // MB
// }

// Helper Comparison Function (Codeforces Style)
function compareOutputs(expected: string, actual: string): boolean {
    if (!expected && !actual) return true;
    if (!expected || !actual) return false;

    // Normalize: split by whitespace to handle different spacing/newlines
    const tokensExp = expected.trim().split(/\s+/);
    const tokensAct = actual.trim().split(/\s+/);

    if (tokensExp.length !== tokensAct.length) return false;

    for (let i = 0; i < tokensExp.length; i++) {
        const tExp = tokensExp[i];
        const tAct = tokensAct[i];

        // 1. Direct string match (Case-Insensitive)
        if (tExp.toLowerCase() === tAct.toLowerCase()) continue;

        // 2. BigInt comparison (for large integers)
        try {
            const biExp = BigInt(tExp);
            const biAct = BigInt(tAct);
            if (biExp === biAct) continue;
            return false;
        } catch {
            // Not valid integers, fallthrough to float comparison
        }

        // 3. Numeric comparison with Epsilon
        const fExp = parseFloat(tExp);
        const fAct = parseFloat(tAct);

        if (!isNaN(fExp) && !isNaN(fAct)) {
            const diff = Math.abs(fExp - fAct);
            if (diff < 1e-5) continue;
        }

        return false;
    }
    return true;
}

export async function POST(req: NextRequest) {
    try {
        // Parse and validate request body
        const rawBody = await req.json();
        const parseResult = RequestSchema.safeParse(rawBody);

        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Invalid request',
                details: parseResult.error.issues.map(i => i.message).join(', ')
            }, { status: 400 });
        }

        const { sourceCode, language, testCases, timeLimit, memoryLimit } = parseResult.data;

        const judgeLanguageId = JUDGE0_LANGUAGE_MAP[language] || 54; // Default to C++

        if (!JUDGE0_API_URL) {
            console.error('JUDGE0_API_URL not configured');
            return NextResponse.json({ error: 'Judge service not configured' }, { status: 503 });
        }

        // ============================================
        // BATCH SUBMISSION TO JUDGE0
        // ============================================

        const batchPayload = {
            submissions: testCases.map(tc => ({
                source_code: Buffer.from(sourceCode).toString('base64'),
                language_id: judgeLanguageId,
                stdin: Buffer.from(tc.input).toString('base64'),
                expected_output: Buffer.from(tc.output).toString('base64'),
                cpu_time_limit: timeLimit / 1000,
                memory_limit: memoryLimit * 1024,
            }))
        };

        // Submit batch
        const batchResponse = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(JUDGE0_AUTH_TOKEN && { 'X-Judge0-Token': JUDGE0_AUTH_TOKEN })
            },
            body: JSON.stringify(batchPayload),
        });

        if (!batchResponse.ok) {
            const errorText = await batchResponse.text();
            console.error('Judge0 Batch API error:', errorText);
            return NextResponse.json({
                error: 'Judge service temporarily unavailable',
                details: process.env.NODE_ENV === 'development' ? errorText : undefined
            }, { status: 503 });
        }

        const batchTokens = await batchResponse.json();

        // Check for valid tokens
        const validTokens = batchTokens.filter((t: Judge0Token) => t.token);
        if (validTokens.length === 0) {
            console.error('Judge0 Batch: No valid submissions returned', batchTokens);
            return NextResponse.json({ error: 'Failed to submit code for judging' }, { status: 500 });
        }

        // Poll for results
        const tokenString = validTokens.map((t: Judge0Token) => t.token).join(',');
        let submissions: Judge0SubmissionResult[] = [];
        let pollAttempts = 0;
        const maxPollAttempts = 20; // 20 seconds max for sample tests

        while (pollAttempts < maxPollAttempts) {
            await new Promise(r => setTimeout(r, 500)); // 0.5 second delay for faster feedback
            pollAttempts++;

            const resultsResponse = await fetch(
                `${JUDGE0_API_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=token,stdout,stderr,status_id,time,memory,compile_output`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(JUDGE0_AUTH_TOKEN && { 'X-Judge0-Token': JUDGE0_AUTH_TOKEN })
                    }
                }
            );

            if (!resultsResponse.ok) {
                console.error('Judge0 poll error:', await resultsResponse.text());
                continue;
            }

            const pollData = await resultsResponse.json();
            submissions = pollData.submissions || [];

            // Check if all completed (status_id >= 3 means finished)
            const allDone = submissions.every((s: Judge0SubmissionResult) => s.status_id >= 3);
            if (allDone) break;
        }

        // Process results
        const results = [];
        let allPassed = true;
        let totalTimeMs = 0;
        let maxMemoryKb = 0;

        for (let i = 0; i < submissions.length; i++) {
            const result = submissions[i];
            const testCase = testCases[i];

            // Decode outputs
            const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8').trim() : '';
            const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';
            const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf-8') : '';

            // Track time and memory
            if (result.time) totalTimeMs += parseFloat(result.time) * 1000;
            if (result.memory && result.memory > maxMemoryKb) maxMemoryKb = result.memory;

            // Determine verdict
            let verdict: string;
            let passed = false;

            switch (result.status_id) {
                case 3: // Accepted
                    if (compareOutputs(testCase.output, stdout)) {
                        verdict = 'Accepted';
                        passed = true;
                    } else {
                        verdict = 'Wrong Answer';
                        allPassed = false;
                    }
                    break;
                case 4:
                    verdict = 'Wrong Answer';
                    allPassed = false;
                    break;
                case 5:
                    verdict = 'Time Limit Exceeded';
                    allPassed = false;
                    break;
                case 6:
                    verdict = 'Compilation Error';
                    allPassed = false;
                    break;
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                    verdict = 'Runtime Error';
                    allPassed = false;
                    break;
                case 13:
                    verdict = 'Internal Error';
                    allPassed = false;
                    break;
                default:
                    verdict = 'Unknown';
                    allPassed = false;
            }

            results.push({
                testCase: i + 1,
                verdict,
                passed,
                time: result.time ? `${result.time}s` : null,
                memory: result.memory ? `${Math.round(result.memory / 1024)}MB` : null,
                output: stdout,
                ...(verdict === 'Compilation Error' && { compileError: compileOutput }),
                ...(verdict === 'Runtime Error' && { runtimeError: stderr }),
            });
        }

        const finalVerdict = allPassed ? 'Accepted' : results.find(r => !r.passed)?.verdict || 'Unknown';
        const passedCount = results.filter(r => r.passed).length;

        return NextResponse.json({
            success: true,
            verdict: finalVerdict,
            passed: allPassed,
            testsPassed: passedCount,
            totalTests: testCases.length,
            time: `${Math.round(totalTimeMs)}ms`,
            memory: `${Math.round(maxMemoryKb)}KB`,
            results,
        });

    } catch (error) {
        console.error('Error in test execution:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
