import { useState, useEffect, useCallback } from 'react';
import { Example } from '@/app/components/mirror/types';

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

    // Load custom test cases from localStorage
    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const customTestKey = `verdict-custom-tests-${safeContestId}-${safeProblemId}`;
        const saved = localStorage.getItem(customTestKey);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setTimeout(() => {
                        setCustomTestCases(parsed.map((tc: Example) => ({ ...tc, isCustom: true })));
                    }, 0);
                }
            } catch {
                // Ignore parse errors
            }
        }
    }, [contestId, problemId]);

    // Save custom test cases to localStorage
    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const customTestKey = `verdict-custom-tests-${safeContestId}-${safeProblemId}`;
        localStorage.setItem(customTestKey, JSON.stringify(customTestCases));
    }, [customTestCases, contestId, problemId]);

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

