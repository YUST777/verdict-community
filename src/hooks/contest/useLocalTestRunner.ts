import { useState, useEffect } from 'react';
import { SubmissionResult, Example } from '@/components/mirror/shared/types';

interface UseLocalTestRunnerParams {
    code: string;
    language: string;
    testCases: Example[];
    timeLimit?: number;
    memoryLimit?: number;
    setIsTestPanelVisible: (visible: boolean) => void;
    contestId?: string;
    problemId?: string;
}

interface UseLocalTestRunnerReturn {
    result: SubmissionResult | null;
    runTests: () => Promise<void>;
    submitting: boolean;
}

export function useLocalTestRunner({
    code,
    language,
    testCases,
    timeLimit = 2000,
    memoryLimit = 256,
    setIsTestPanelVisible,
    contestId,
    problemId
}: UseLocalTestRunnerParams): UseLocalTestRunnerReturn {
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Clear result when problem changes
    useEffect(() => {
        setResult(null);
    }, [contestId, problemId]);

    const runTests = async () => {
        if (!code.trim() || submitting || testCases.length === 0) return;

        setSubmitting(true);
        setIsTestPanelVisible(true);

        // Bypassing Judge0 for Vercel Serverless environment
        setTimeout(() => {
            setResult({
                verdict: 'Offline',
                passed: false,
                testsPassed: 0,
                totalTests: testCases.length,
                results: [{
                    testCase: 1,
                    verdict: 'Local Testing Disabled',
                    passed: false,
                    output: 'Local test execution is disabled in the serverless environment. Please click the Submit button to solve, test, and submit directly on Codeforces!'
                }]
            });
            setSubmitting(false);
        }, 500);
    };

    return {
        result,
        runTests,
        submitting
    };
}

