import { useState, useEffect, useCallback, useRef } from 'react';
import { Example } from '@/components/mirror/shared/types';

interface UseCustomTestCasesParams {
    contestId: string;
    problemId: string;
    sampleTestCasesCount: number;
}

interface UseCustomTestCasesReturn {
    customTestCases: Example[];
    handleAdd: (testCase: Example) => void;
    handleDelete: (index: number) => void;
    handleUpdate: (index: number, testCase: Example) => void;
}

export function useCustomTestCases({ contestId, problemId, sampleTestCasesCount }: UseCustomTestCasesParams): UseCustomTestCasesReturn {
    const [customTestCases, setCustomTestCases] = useState<Example[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
    const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

    const dbProblemId = `${safeContestId}-${safeProblemId}`;
    const customTestKey = `verdict-custom-tests-${safeContestId}-${safeProblemId}`;

    // Load custom test cases from localStorage and DB
    useEffect(() => {
        if (!contestId || !problemId) return;

        async function loadData() {
            const savedLocal = localStorage.getItem(customTestKey);
            let parsedLocal: Example[] = [];

            if (savedLocal) {
                try {
                    const parsed = JSON.parse(savedLocal);
                    if (Array.isArray(parsed)) {
                        parsedLocal = parsed.map((tc: Example) => ({ ...tc, isCustom: true }));
                    }
                } catch {
                    // Ignore parsing error
                }
            }

            try {
                const res = await fetch(`/api/workspace/sync?problemId=${encodeURIComponent(dbProblemId)}`);
                if (res.ok) {
                    const { data } = await res.json();
                    if (data && data.custom_test_cases) {
                        setCustomTestCases(data.custom_test_cases.map((tc: Example) => ({ ...tc, isCustom: true })));
                    } else if (parsedLocal.length > 0) {
                        setCustomTestCases(parsedLocal);
                    } else {
                        setCustomTestCases([]);
                    }
                } else if (parsedLocal.length > 0) {
                    setCustomTestCases(parsedLocal);
                } else {
                    setCustomTestCases([]);
                }
            } catch (err) {
                console.error('[workspace/sync] Failed to load DB test cases', err);
                if (parsedLocal.length > 0) {
                    setCustomTestCases(parsedLocal);
                } else {
                    setCustomTestCases([]);
                }
            }
            setIsLoaded(true);
        }

        loadData();
    }, [contestId, problemId, customTestKey, dbProblemId]);

    // Save custom test cases to localStorage & Debounced upsert to Supabase
    useEffect(() => {
        if (!isLoaded) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;
        const customTestKey = `verdict-custom-tests-${safeContestId}-${safeProblemId}`;

        // Save locally first
        localStorage.setItem(customTestKey, JSON.stringify(customTestCases));

        // Debounce DB upsert
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch('/api/workspace/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId: dbProblemId,
                        customTestCases
                    })
                });
            } catch (err) {
                console.error('[workspace/sync] Failed to sync test cases to db', err);
            }
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [customTestCases, contestId, problemId, dbProblemId, isLoaded]);

    const handleAdd = useCallback((testCase: Example) => {
        setCustomTestCases(prev => [...prev, { ...testCase, isCustom: true }]);
    }, []);

    const handleDelete = useCallback((index: number) => {
        // Only allow deleting custom test cases (index >= sampleTestCasesCount)
        const customIndex = index - sampleTestCasesCount;
        if (customIndex >= 0) {
            setCustomTestCases(prev => prev.filter((_, i) => i !== customIndex));
        }
    }, [sampleTestCasesCount]);

    const handleUpdate = useCallback((index: number, testCase: Example) => {
        // Only allow updating custom test cases
        const customIndex = index - sampleTestCasesCount;
        if (customIndex >= 0) {
            setCustomTestCases(prev => prev.map((tc, i) =>
                i === customIndex ? { ...testCase, isCustom: true } : tc
            ));
        }
    }, [sampleTestCasesCount]);

    return {
        customTestCases,
        handleAdd,
        handleDelete,
        handleUpdate
    };
}
