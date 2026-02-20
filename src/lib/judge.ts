
import { Judge0Token, Judge0SubmissionResult } from '@/lib/types';

// Self-hosted Judge0 Configuration
// Self-hosted Judge0 Configuration
// If running in Docker via nextjs, use the container name/IP if on same network, or host.docker.internal
// For local dev, localhost is fine.
const JUDGE0_API_URL = process.env.JUDGE0_URL || process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_AUTH_TOKEN = process.env.JUDGE0_AUTH_TOKEN;

export const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
    'c': 50,          // C (GCC 9.2.0)
    'cpp': 54,        // C++ (GCC 9.2.0)
    'cpp17': 54,
    'cpp20': 54,
    'java': 62,       // Java (OpenJDK 13.0.1)
    'python': 71,     // Python (3.8.1)
    'python3': 71,
    'javascript': 63, // JavaScript (Node.js 12.14.0)
    'node': 63,
    'typescript': 74, // TypeScript (3.7.4)
    'csharp': 51,     // C# (Mono 6.6.0.161)
    'kotlin': 78,     // Kotlin (1.3.70)
    'go': 60,         // Go (1.13.5)
    'rust': 73,       // Rust (1.40.0)
    'ruby': 72,       // Ruby (2.7.0)
    'swift': 83,      // Swift (5.2.3)
    'php': 68,        // PHP (7.4.1)
};

export interface TestCase {
    input: string;
    output: string;
}

export interface JudgeResult {
    testCase: number;
    verdict: string;
    passed: boolean;
    time: string | null;
    memory: string | null;
    output: string;
    compileError?: string;
    runtimeError?: string;
}

export interface BatchExecutionResult {
    success: boolean;
    verdict: string;
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    time: string;
    memory: string;
    results: JudgeResult[];
    error?: string;
    details?: string;
}

// Helper Comparison Function (Codeforces Style)
export function compareOutputs(expected: string, actual: string): boolean {
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

        // 2. BigInt comparison (for large integers > 2^53)
        try {
            const biExp = BigInt(tExp);
            const biAct = BigInt(tAct);
            if (biExp === biAct) continue;

            // If both are valid BigInts but different, they are definitely different
            // Do NOT fall back to float comparison, or we lose precision for large integers
            return false;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            // Not valid integers (decimals like "1.0", scientific notation, or non-numeric)
            // Fallthrough to float comparison
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

/**
 * Execute a batch of test cases against the Judge0 API
 */
export async function executeBatchOnJudge0(
    sourceCode: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number = 2000,
    memoryLimit: number = 256
): Promise<BatchExecutionResult> {
    // Normalize language string
    let normalizedLang = language.toLowerCase().trim();

    // Map common aliases to Judge0 keys
    if (normalizedLang === 'c++' || normalizedLang === 'cpp' || normalizedLang.includes('c++')) normalizedLang = 'cpp';
    else if (normalizedLang === 'c#' || normalizedLang === 'csharp') normalizedLang = 'csharp';
    else if (normalizedLang === 'python' || normalizedLang === 'py') normalizedLang = 'python';
    else if (normalizedLang === 'node.js' || normalizedLang === 'node' || normalizedLang === 'javascript' || normalizedLang === 'js') normalizedLang = 'javascript';
    else if (normalizedLang === 'golang' || normalizedLang === 'go') normalizedLang = 'go';
    else if (normalizedLang === 'rust' || normalizedLang === 'rs') normalizedLang = 'rust';
    else if (normalizedLang === 'kotlin' || normalizedLang === 'kt') normalizedLang = 'kotlin';
    else if (normalizedLang === 'java') normalizedLang = 'java';

    const judgeLanguageId = JUDGE0_LANGUAGE_MAP[normalizedLang] || JUDGE0_LANGUAGE_MAP['cpp'];

    if (!judgeLanguageId) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(JUDGE0_LANGUAGE_MAP).join(', ')}`);
    }

    // console.log(`[Judge0] Execution Request: ${language} (ID: ${judgeLanguageId}) -> ${JUDGE0_API_URL}`);

    if (!JUDGE0_API_URL) {
        console.error('JUDGE0_API_URL not configured');
        throw new Error('Judge service not configured');
    }

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

    try {
        console.log(`[Judge0] Attempting connection to: ${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`);

        // Submit batch
        const batchResponse = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                ...(JUDGE0_AUTH_TOKEN && {
                    'X-Judge0-Token': JUDGE0_AUTH_TOKEN,
                    'X-Auth-Token': JUDGE0_AUTH_TOKEN
                })
            },
            body: JSON.stringify(batchPayload),
        });

        if (!batchResponse.ok) {
            const errorText = await batchResponse.text();
            console.error(`Judge0 Batch API error (${batchResponse.status} ${batchResponse.statusText}):`, errorText);
            throw new Error(`Judge service error: ${batchResponse.status} ${batchResponse.statusText} - ${errorText}`);
        }

        const batchTokens = await batchResponse.json();

        // Check for valid tokens
        const validTokens = batchTokens.filter((t: Judge0Token) => t.token);
        if (validTokens.length === 0) {
            throw new Error('Failed to submit code for judging: No valid tokens');
        }

        // Poll for results
        const tokenString = validTokens.map((t: Judge0Token) => t.token).join(',');
        let submissions: Judge0SubmissionResult[] = [];
        let pollAttempts = 0;
        const maxPollAttempts = 40; // 20 seconds max (increased for reliability)

        while (pollAttempts < maxPollAttempts) {
            await new Promise(r => setTimeout(r, 500)); // 0.5 second delay
            pollAttempts++;

            const resultsResponse = await fetch(
                `${JUDGE0_API_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=token,stdout,stderr,status_id,time,memory,compile_output`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(JUDGE0_AUTH_TOKEN && {
                            'X-Judge0-Token': JUDGE0_AUTH_TOKEN,
                            'X-Auth-Token': JUDGE0_AUTH_TOKEN
                        })
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
        const results: JudgeResult[] = [];
        let allPassed = true;
        let totalTimeMs = 0;
        let maxMemoryKb = 0;

        for (let i = 0; i < submissions.length; i++) {
            const result = submissions[i];
            const testCase = testCases[i];

            // Safety check: ensure test case exists
            if (!testCase) {
                console.error(`[Judge0] Test case ${i} not found in testCases array (submissions: ${submissions.length}, testCases: ${testCases.length})`);
                continue;
            }

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

        return {
            success: true,
            verdict: finalVerdict,
            passed: allPassed,
            testsPassed: passedCount,
            totalTests: testCases.length,
            time: `${Math.round(totalTimeMs)}ms`,
            memory: `${Math.round(maxMemoryKb)}KB`,
            results,
        };
    } catch (error: any) {
        console.error('Judge0 Execution Error:', error);
        return {
            success: false,
            verdict: 'Internal Error',
            passed: false,
            testsPassed: 0,
            totalTests: testCases.length,
            time: '0ms',
            memory: '0KB',
            results: [],
            error: error.message || 'Unknown Judge0 error',
            details: error instanceof Error ? error.stack : undefined
        };
    }
}
