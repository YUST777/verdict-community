import { useState, useEffect } from 'react';
import { Problem, CFProblemData, Example } from '@/components/mirror/shared/types';

interface UseProblemDataParams {
    contestId: string;
    problemId: string;
    urlType: string;
    groupId?: string;
    initialData?: CFProblemData | null;
}

interface UseProblemDataReturn {
    problem: Problem | null;
    cfData: CFProblemData | null;
    loading: boolean;
    error: string | null;
    cfStats: { rating?: number; solvedCount: number; tags?: string[] } | null;
    sampleTestCases: Example[];
}

export function useProblemData({ contestId, problemId, urlType, groupId, initialData }: UseProblemDataParams): UseProblemDataReturn {
    const [cfData, setCfData] = useState<CFProblemData | null>(initialData || null);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const [cfStats, setCfStats] = useState<{ rating?: number; solvedCount: number; tags?: string[] } | null>(null);
    const [sampleTestCases, setSampleTestCases] = useState<Example[]>([]);

    // Transform logic helper
    const transformData = (data: CFProblemData) => {
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
        return mappedProblem;
    };

    // Handle initialData transformation on mount
    useEffect(() => {
        if (initialData) {
            const mapped = transformData(initialData);
            setProblem(mapped);
            setSampleTestCases(mapped.examples);
            setLoading(false);
        }
    }, [initialData]);

    // Fetch Low Cost Global Stats
    useEffect(() => {
        if (!contestId || !problemId) return;
        fetch(`/api/codeforces/problem-stats?contestId=${contestId}&index=${problemId}`)
            .then(res => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => {
                if (data && !data.error) setCfStats(data);
            })
            .catch(err => {
                // Silent fail for stats is fine, just log debug
                console.debug('Failed to load CF stats', err);
            });
    }, [contestId, problemId]);

    // Fetch problem from Codeforces Mirror API
    useEffect(() => {
        const fetchProblem = async () => {
            if (initialData) return; // Skip if we have initial data

            try {
                // Smart Fallback: If contestId >= 100,000, it's likely a Gym/Sheet problem
                let effectiveType = urlType;
                const numericId = parseInt(contestId);
                if (urlType === 'contest' && !isNaN(numericId) && numericId >= 100000) {
                    effectiveType = 'gym';
                }

                const res = await fetch(`/api/codeforces/mirror?contestId=${contestId}&problemId=${problemId}&type=${effectiveType}${groupId ? `&groupId=${groupId}` : ''}`);
                if (res.ok) {
                    const data: CFProblemData = await res.json();
                    setCfData(data);

                    const mappedProblem = transformData(data);
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

        if (contestId && problemId && !initialData) {
            setCfData(null);
            setProblem(null);
            setCfStats(null);
            setSampleTestCases([]);
            setLoading(true);
            setError(null);

            fetchProblem();
        }
    }, [contestId, problemId, urlType, groupId, initialData]);

    return {
        problem,
        cfData,
        loading,
        error,
        cfStats,
        sampleTestCases
    };
}

