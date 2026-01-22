import { z } from 'zod';

export interface Example {
    input: string;
    output: string;
    expectedOutput?: string;
    isCustom?: boolean; // True if added by user
}

// Zod schema for custom test case validation
export const customTestCaseSchema = z.object({
    input: z.string().min(1, 'Input is required').max(50000, 'Input too long (max 50KB)'),
    output: z.string().max(50000, 'Expected output too long (max 50KB)').optional().default(''),
});

export interface Problem {
    id: string;
    title: string;
    timeLimit: number; // ms
    memoryLimit: number; // MB
    statement: string;
    inputFormat: string;
    outputFormat: string;
    examples: Example[];
    testCases?: Example[];
    note?: string;
}

export interface Submission {
    id: number;
    verdict: string;
    timeMs: number;
    memoryKb: number;
    testsPassed: number;
    totalTests: number;
    submittedAt: string;
    attemptNumber: number;
    sourceCode?: string;
}

export interface TestCaseResult {
    testCase: number;
    verdict: string;
    passed: boolean;
    time?: string;
    memory?: string;
    output?: string;
    compileError?: string;
    runtimeError?: string;
}

export interface SubmissionResult {
    submissionId?: number;
    verdict: string;
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    time?: string;
    memory?: string;
    attemptNumber?: number;
    results: TestCaseResult[];
}

export interface DistributionEntry {
    label: string;
    count: number;
    isUser?: boolean;
}

export interface AnalyticsStats {
    runtimeDistribution: DistributionEntry[];
    memoryDistribution: DistributionEntry[];
    totalSubmissions: number;
    userStats: {
        runtime: { value: number; percentile: number };
        memory: { value: number; percentile: number };
    } | null;
}

export interface ComplexityAnalysis {
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
}

export interface CFProblemData {
    meta: {
        title: string;
        timeLimitMs: number;
        memoryLimitMB: number;
    };
    story: string;
    inputSpec: string;
    outputSpec: string;
    testCases: { input: string; output: string }[];
    note: string;
}

// Codeforces Submission Status (for live tracking)
export interface CFSubmissionStatus {
    status: 'idle' | 'submitting' | 'waiting' | 'testing' | 'done' | 'error';
    verdict?: string;
    testNumber?: number;
    time?: number; // ms
    memory?: number; // KB
    submissionId?: number;
    error?: string;
    isDuplicate?: boolean;
    compilationError?: string;
    failedTestCase?: number; // The test case number that failed (1-indexed for display)
    needsCaptcha?: boolean; // True if user needs to manually solve captcha
    captchaUrl?: string; // URL to open for captcha solving
}
