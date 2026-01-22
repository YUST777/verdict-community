import { useState, useEffect } from 'react';
import { Problem, CFProblemData, Example } from '@/app/components/mirror/types';

interface UseProblemDataParams {
    contestId: string;
    problemId: string;
    urlType: string;
    groupId?: string;
}

interface UseProblemDataReturn {
    problem: Problem | null;
    cfData: CFProblemData | null;
    loading: boolean;
    error: string | null;
    cfStats: { rating?: number; solvedCount: number } | null;
    sampleTestCases: Example[];
}

export function useProblemData({ contestId, problemId, urlType, groupId }: UseProblemDataParams): UseProblemDataReturn {
    const [cfData, setCfData] = useState<CFProblemData | null>(null);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cfStats, setCfStats] = useState<{ rating?: number; solvedCount: number } | null>(null);
    const [sampleTestCases, setSampleTestCases] = useState<Example[]>([]);

    // Fetch Low Cost Global Stats
    useEffect(() => {
        if (!contestId || !problemId) return;
        fetch(`/api/codeforces/problem-stats?contestId=${contestId}&index=${problemId}`)
            .then(res => res.json())
            .then(data => { if (data && !data.error) setCfStats(data); })
            .catch(err => console.error('Failed to load CF stats', err));
    }, [contestId, problemId]);

    // Fetch problem from Codeforces Mirror API
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await fetch(`/api/codeforces/mirror?contestId=${contestId}&problemId=${problemId}&type=${urlType}${groupId ? `&groupId=${groupId}` : ''}`);
                if (res.ok) {
                    const data: CFProblemData = await res.json();
                    setCfData(data);

                    // Transform to Problem interface for components that need it
                    const mappedProblem: Problem = {
                        id: Array.isArray(problemId) ? problemId[0].toUpperCase() : problemId.toUpperCase(),
                        title: data.meta.title,
                        statement: data.story,
                        inputFormat: data.inputSpec || 'See problem statement',
                        outputFormat: data.outputSpec || 'See problem statement',
                        examples: data.testCases.map((tc) => ({
                            input: tc.input,
                            output: tc.output,
                            expectedOutput: tc.output
                        })),
                        note: data.note || undefined,
                        timeLimit: data.meta.timeLimitMs,
                        memoryLimit: data.meta.memoryLimitMB
                    };

                    setProblem(mappedProblem);
                    setSampleTestCases(mappedProblem.examples);
                } else {
                    const err = await res.json();
                    setError(err.error || 'Failed to fetch problem');
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Network error');
            } finally {
                setLoading(false);
            }
        };

        if (contestId && problemId) {
            fetchProblem();
        }
    }, [contestId, problemId, urlType, groupId]);

    return {
        problem,
        cfData,
        loading,
        error,
        cfStats,
        sampleTestCases
    };
}

