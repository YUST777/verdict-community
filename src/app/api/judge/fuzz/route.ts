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

        const extractStdin = (tc: { input?: string } | string): string => {
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

        // 3. Poll for results (reduced iterations so fuzz doesn't stretch to minutes)
        const fetchResults = async (tokens: { token?: string }[]): Promise<{ status_id?: number; stdout?: string; stderr?: string; compile_output?: string }[]> => {
            const tokenString = tokens.map((t: { token?: string }) => t.token).join(',');
            let results: { status_id?: number; stdout?: string; stderr?: string; compile_output?: string }[] = [];

            for (let i = 0; i < 8; i++) {
                await new Promise(r => setTimeout(r, 800));
                const res = await fetch(`${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=false&fields=status_id,stdout,stderr,compile_output,time,memory`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.submissions && Array.isArray(data.submissions)) {
                        results = data.submissions;
                        const allFinished = results.every((r: { status_id?: number }) => (r.status_id ?? 0) >= 3);
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
        let failingCase: { input: string; expected: string; actual: string; statusId?: number } | null = null;

        for (let i = 0; i < edgeCases.length; i++) {
            const refResult = refResults[i] as { status_id?: number; stdout?: string } | undefined;
            const aiResult = aiResults[i] as { status_id?: number; stdout?: string; stderr?: string; compile_output?: string } | undefined;
            const expectedOut = (refResult?.stdout || '').trim();
            const actualOut = (aiResult?.stdout || '').trim();

            if (refResult?.status_id !== 3) continue;

            if (aiResult?.status_id !== 3 || expectedOut !== actualOut) {
                passed = false;
                const edgeInput = edgeCases[i];
                failingCase = {
                    input: typeof edgeInput === 'object' && edgeInput !== null && 'input' in edgeInput ? String(edgeInput.input ?? '') : String(edgeInput),
                    expected: expectedOut,
                    actual: actualOut || (aiResult?.stderr || aiResult?.compile_output || 'Time Limit Exceeded or Runtime Error'),
                    statusId: aiResult?.status_id
                };
                break;
            }
        }

        return NextResponse.json({ passed, failingCase });

    } catch (error: unknown) {
        console.error('[Judge] Fuzz error', error);
        return NextResponse.json({
            passed: true,
            error: error instanceof Error ? error.message : 'Fuzz failed'
        });
    }
}
