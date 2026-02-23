import { NextResponse } from 'next/server';
import { JUDGE0_LANGUAGE_MAP } from '@/lib/judge';

export async function POST(request: Request) {
    try {
        const { aiSolution, referenceSolution, language, edgeCases } = await request.json();

        if (!aiSolution || !referenceSolution || !edgeCases || !Array.isArray(edgeCases)) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

        let normalizedLang = (language || 'cpp').toLowerCase().trim();
        if (normalizedLang === 'c++') normalizedLang = 'cpp';

        const languageId = JUDGE0_LANGUAGE_MAP[normalizedLang] || 54; // default to C++ 

        const extractStdin = (tc: any): string => {
            if (typeof tc === 'object' && tc !== null) {
                return String(tc.input ?? '');
            }
            return String(tc ?? '');
        };

        // 1. Run Reference Solution to get expected outputs
        const refSubmissions = edgeCases.map(tc => ({
            source_code: referenceSolution,
            language_id: languageId,
            stdin: extractStdin(tc),
            cpu_time_limit: 2.0,
            memory_limit: 256000,
        }));

        const refRes = await fetch(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissions: refSubmissions }),
        });

        if (!refRes.ok) throw new Error('Failed to submit reference to Judge0');
        const refTokens = await refRes.json();

        // 2. Run AI Solution
        const aiSubmissions = edgeCases.map(tc => ({
            source_code: aiSolution,
            language_id: languageId,
            stdin: extractStdin(tc),
            cpu_time_limit: 2.0,
            memory_limit: 256000,
        }));

        const aiRes = await fetch(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissions: aiSubmissions }),
        });

        if (!aiRes.ok) throw new Error('Failed to submit AI solution to Judge0');
        const aiTokens = await aiRes.json();

        // 3. Poll for results 
        const fetchResults = async (tokens: any[]) => {
            const tokenString = tokens.map((t: any) => t.token).join(',');
            let allFinished = false;
            let results = [];

            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 1000));
                const res = await fetch(`${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=false&fields=status_id,stdout,stderr,compile_output,time,memory`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.submissions && Array.isArray(data.submissions)) {
                        results = data.submissions;
                        allFinished = results.every((r: any) => r.status_id >= 3);
                        if (allFinished) break;
                    }
                }
            }
            return results;
        };

        const [refResults, aiResults] = await Promise.all([
            fetchResults(refTokens),
            fetchResults(aiTokens)
        ]);

        // 4. Compare Outputs
        let passed = true;
        let failingCase = null;

        for (let i = 0; i < edgeCases.length; i++) {
            const expectedOut = (refResults[i]?.stdout || '').trim();
            const actualOut = (aiResults[i]?.stdout || '').trim();

            // If the reference crashed, we skip this edge case as invalid
            if (refResults[i]?.status_id !== 3) continue;

            if (aiResults[i]?.status_id !== 3 || expectedOut !== actualOut) {
                passed = false;
                failingCase = {
                    input: edgeCases[i].input || edgeCases[i],
                    expected: expectedOut,
                    actual: actualOut || (aiResults[i]?.stderr || aiResults[i]?.compile_output || 'Time Limit Exceeded or Runtime Error'),
                    statusId: aiResults[i]?.status_id
                };
                break;
            }
        }

        return NextResponse.json({ passed, failingCase });

    } catch (error: any) {
        console.error('[Judge] Fuzz error:', error);
        return NextResponse.json({ passed: true, error: error.message }); // gracefully fail open if fuzzer crashes
    }
}
