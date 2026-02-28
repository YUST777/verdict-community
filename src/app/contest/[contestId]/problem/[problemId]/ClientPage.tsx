'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { OnMount } from '@monaco-editor/react';
import { Loader2, AlertCircle, FlaskConical } from 'lucide-react';
import { Submission, AnalyticsStats } from '@/components/mirror/shared/types';
import { ProblemHeader } from '@/components/mirror/problem';
import { CodeWorkspace, ComplexityModal } from '@/components/mirror/editor';
import { ProblemLeftPanel } from '@/components/mirror/problem';
import { SidebarTabs, TabData } from '@/components/mirror/problem/SidebarTabs';
import ExtensionGate from '@/components/core/ExtensionGate';
import Link from 'next/link';
import ExtensionOnboardingModal from '@/components/mirror/ExtensionOnboardingModal';
import { useAuth } from '@/contexts/AuthContext';
import { TestCasesLoader } from '@/components/ui/TestCasesLoader';

// Custom Hooks
import { useProblemData } from '@/hooks/contest/useProblemData';
import { useCodePersistence } from '@/hooks/contest/useCodePersistence';
import { useCustomTestCases } from '@/hooks/contest/useCustomTestCases';
import { useResizableLayout } from '@/hooks/contest/useResizableLayout';
import { useWhiteboardResize } from '@/hooks/contest/useWhiteboardResize';
import { useCodeforcesSubmission } from '@/hooks/contest/useCodeforcesSubmission';
import { useLocalTestRunner } from '@/hooks/contest/useLocalTestRunner';
import { useCodeforcesHandle } from '@/hooks/contest/useCodeforcesHandle';

// Utils
import { getNavigationBaseUrl } from '@/lib/codeforcesUtils';

interface CodeforcesMirrorPageProps {
    forcedType?: string;
}

export default function CodeforcesMirrorPage({ forcedType }: CodeforcesMirrorPageProps = {}) {
    const params = useParams();
    const searchParams = useSearchParams();

    // Extract standard params
    const contestId = params.contestId as string;
    const problemId = params.problemId as string;
    const groupId = params.groupId as string;
    // Determine URL type with smart fallback
    let urlType = forcedType || searchParams.get('type') || 'contest';
    const numericContestId = parseInt(contestId);
    if (urlType === 'contest' && !isNaN(numericContestId) && numericContestId >= 100000) {
        urlType = 'gym';
    }

    // Problem Data Hook
    const { problem, cfData, loading, error, cfStats, sampleTestCases } = useProblemData({
        contestId,
        problemId,
        urlType,
        groupId
    });

    // Code Persistence Hook
    const { code, setCode, language, setLanguage } = useCodePersistence({ contestId, problemId });

    // Custom Test Cases Hook
    const sampleTestCasesCount = sampleTestCases.length;
    const { customTestCases, handleAdd: handleAddTestCase, handleDelete: handleDeleteTestCase, handleUpdate: handleUpdateTestCase } = useCustomTestCases({
        contestId,
        problemId,
        sampleTestCasesCount
    });

    // Combined test cases
    const testCases = [...sampleTestCases, ...customTestCases];

    // Layout Hooks
    const { containerRef, leftPanelRef, isResizing, handleMouseDown, lastWidth } = useResizableLayout();
    const { whiteboardHeight, handleResizeStart: handleWhiteboardResizeStart } = useWhiteboardResize();

    // Codeforces Handle
    const { handle: cfHandle, setHandle: setCfHandle, loading: handleLoading } = useCodeforcesHandle();

    // Tab State
    const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'analytics' | 'solution'>('description');
    const [isWhiteboardExpanded, setIsWhiteboardExpanded] = useState(false);
    const [mobileView, setMobileView] = useState<'problem' | 'code'>('problem');
    const [isTestPanelVisible, setIsTestPanelVisible] = useState(true);
    const [testPanelActiveTab, setTestPanelActiveTab] = useState<'testcase' | 'result' | 'codeforces'>('testcase');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

    // Track tab navigation in session storage
    useEffect(() => {
        if (!user || !contestId || !problemId) return;
        const currentUrl = `/contest/${contestId}/problem/${problemId}`;
        const title = cfData?.meta?.title || `CF ${contestId}${problemId}`;

        (async () => {
            try {
                const res = await fetch('/api/user/tabs');
                if (!res.ok) return;
                const data = await res.json();
                const existing: TabData[] = data.data || [];

                const activeTabId = sessionStorage.getItem('activeVerdictTabId');

                if (activeTabId) {
                    const tabIndex = existing.findIndex(t => t.id === activeTabId);
                    if (tabIndex !== -1 && existing[tabIndex].url !== currentUrl) {
                        // We came from a known tab. Update that tab's URL to our new location.
                        existing[tabIndex] = { ...existing[tabIndex], title, url: currentUrl };
                        await fetch('/api/user/tabs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ tabs: existing })
                        });
                        return;
                    } else if (tabIndex !== -1) {
                        // Tab already matches our current URL
                        return;
                    }
                }

                // If there's no activeTabId, or it wasn't found, we should see if this URL is already open
                const existingTab = existing.find(t => t.url === currentUrl);
                if (existingTab) {
                    sessionStorage.setItem('activeVerdictTabId', existingTab.id);
                } else {
                    // Create a brand new tab
                    const newTabId = `tab-${contestId}-${problemId}-${Date.now()}`;
                    await fetch('/api/user/tabs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tabs: [...existing, { id: newTabId, title, url: currentUrl }] })
                    });
                    sessionStorage.setItem('activeVerdictTabId', newTabId);
                }
            } catch { }
        })();
    }, [user, contestId, problemId, cfData]);

    // Submissions & Analytics State
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [stats, setStats] = useState<AnalyticsStats | null>(null);

    // Complexity Analysis State
    const [complexityResult, setComplexityResult] = useState<{
        timeComplexity: string;
        spaceComplexity: string;
        explanation: string;
    } | null>(null);
    const [complexityLoading, setComplexityLoading] = useState(false);
    const [showComplexityModal, setShowComplexityModal] = useState(false);

    // AI Code State
    const [aiCode, setAiCode] = useState<string>('');
    const [codeTab, setCodeTab] = useState<'human' | 'ai'>('human');
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [aiInitialQuestion, setAiInitialQuestion] = useState<string>('');
    const [selectedLineReference, setSelectedLineReference] = useState<string>('');

    // Reset UI State on Navigation (Prevent Ghost State)
    useEffect(() => {
        setAiCode('');
        setCodeTab('human');
        setIsGeneratingSolution(false);
        setSelectedCode('');
        setAiInitialQuestion('');
        setSelectedLineReference('');
        setActiveTab('description');
        setIsTestPanelVisible(true);
        setTestPanelActiveTab('testcase');
        // Reset submisssions and stats is handled by their own hooks/effects
    }, [contestId, problemId]);

    // Editor Ref
    const editorRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    // Determine which code to execute (User vs AI)
    const codeToExecute = codeTab === 'ai' ? aiCode : code;

    // Submission Hooks
    const { cfStatus, handleSubmit, submitting: cfSubmitting } = useCodeforcesSubmission({
        code: codeToExecute,
        language,
        contestId,
        problemId,
        urlType,
        groupId,
        setIsTestPanelVisible,
        setTestPanelActiveTab
    });

    const { result, runTests, submitting: testSubmitting } = useLocalTestRunner({
        code: codeToExecute,
        language,
        testCases,
        timeLimit: cfData?.meta.timeLimitMs || 2000,
        memoryLimit: cfData?.meta.memoryLimitMB || 256,
        setIsTestPanelVisible,
        contestId,
        problemId
    });

    const submitting = cfSubmitting || testSubmitting;

    // AI Action Handlers
    const handleAskAboutCode = (code: string, lineReference?: string) => {
        setSelectedCode(code);
        setSelectedLineReference(lineReference || '');
        // Don't pre-fill question - let user type naturally, just show the @ reference
        setAiInitialQuestion('');
        setActiveTab('solution');
    };

    const handleExplainLine = (lineNumber: number, lineCode: string) => {
        setSelectedCode(lineCode);
        setAiInitialQuestion(`Explain line ${lineNumber}:\n\`\`\`${language}\n${lineCode}\n\`\`\``);
        setActiveTab('solution');
    };

    const handleExplainFunction = (functionCode: string) => {
        setSelectedCode(functionCode);
        setAiInitialQuestion(`Explain this function:\n\`\`\`${language}\n${functionCode}\n\`\`\``);
        setActiveTab('solution');
    };

    const handleOptimizeCode = (codeToOptimize: string) => {
        setSelectedCode(codeToOptimize);
        setAiInitialQuestion(`How can I optimize this code? Also analyze its time and space complexity:\n\`\`\`${language}\n${codeToOptimize}\n\`\`\``);
        setActiveTab('solution');
    };

    const handleFindBugs = (codeToAnalyze: string) => {
        setSelectedCode(codeToAnalyze);
        setAiInitialQuestion(`Find potential bugs or issues in this code:\n\`\`\`${language}\n${codeToAnalyze}\n\`\`\``);
        setActiveTab('solution');
    };

    const handleClearSelection = () => {
        setSelectedCode('');
        setAiInitialQuestion('');
        setSelectedLineReference('');
    };

    // Complexity analysis mock
    const analyzeComplexity = async () => {
        setComplexityLoading(true);
        setShowComplexityModal(true);
        setComplexityResult({
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            explanation: 'Complexity analysis is not available in mirror mode.'
        });
        setComplexityLoading(false);
    };

    // AI Solution Generation
    const handleSolveProblem = async () => {
        if (isGeneratingSolution) return;

        setIsGeneratingSolution(true);
        // TODO: Call AI API to generate solution
        // Simulate for now
        setTimeout(() => {
            setAiCode(`// AI Generated Solution\n// This will be replaced with actual AI solution\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Solution coming soon...\n    return 0;\n}`);
            setCodeTab('ai'); // Switch to AI tab
            setIsGeneratingSolution(false);
        }, 2000);
    };

    // Fetch submissions from API (user's own submissions only)
    const fetchSubmissions = useCallback(async () => {
        if (!contestId || !problemId) return;

        // Wait for handle to load
        if (handleLoading) return;

        // If no handle, don't fetch submissions
        if (!cfHandle) {
            setSubmissions([]);
            setSubmissionsLoading(false);
            return;
        }

        setSubmissionsLoading(true);
        try {
            const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
            const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

            // Normalize problemId to uppercase (Codeforces uses uppercase indices)
            const normalizedProblemId = safeProblemId.toUpperCase();

            // Fetch user's submissions for this problem
            const res = await fetch(`/api/codeforces/user-submissions?handle=${encodeURIComponent(cfHandle)}&contestId=${safeContestId}&problemIndex=${normalizedProblemId}`);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('[Submissions] API Error:', {
                    status: res.status,
                    error: errorData.error,
                    handle: cfHandle,
                    contestId: safeContestId,
                    problemId: normalizedProblemId
                });
                setSubmissions([]);
                setSubmissionsLoading(false);
                return;
            }

            const data = await res.json();

            if (!data.success) {
                console.error('[Submissions] API returned error:', data.error);
                setSubmissions([]);
                setSubmissionsLoading(false);
                return;
            }

            if (!data.submissions || !Array.isArray(data.submissions)) {
                console.warn('[Submissions] No submissions found:', {
                    handle: cfHandle,
                    contestId: safeContestId,
                    problemId: normalizedProblemId,
                    response: data
                });
                setSubmissions([]);
                setSubmissionsLoading(false);
                return;
            }

            // Map to our Submission interface
            const mappedSubmissions: Submission[] = data.submissions.map((sub: { id: number; verdict: string; timeConsumedMillis?: number; memoryConsumedBytes?: number; creationTimeSeconds: number; language?: string; passedTestCount?: number }, index: number) => {
                const passedTests = sub.passedTestCount || 0;
                // For accepted submissions, we don't know total tests, so use passedTests as total
                // For non-accepted, we also use passedTests as an estimate
                const totalTests = sub.verdict === 'Accepted' ? passedTests : Math.max(passedTests + 1, 1);

                return {
                    id: sub.id,
                    verdict: sub.verdict || 'Unknown', // API already converts 'OK' to 'Accepted'
                    timeMs: sub.timeConsumedMillis || 0,
                    memoryKb: sub.memoryConsumedBytes ? Math.round(sub.memoryConsumedBytes / 1024) : 0,
                    testsPassed: passedTests,
                    totalTests: totalTests,
                    submittedAt: new Date(sub.creationTimeSeconds * 1000).toISOString(),
                    attemptNumber: data.submissions.length - index // Most recent = highest attempt number
                };
            });

            console.log('[Submissions] Loaded:', {
                count: mappedSubmissions.length,
                handle: cfHandle,
                contestId: safeContestId,
                problemId: normalizedProblemId
            });

            setSubmissions(mappedSubmissions);

            // Calculate Analytics Client-Side (user's own submissions only)
            const accepted = data.submissions.filter((s: { verdict: string }) => s.verdict === 'Accepted');
            if (accepted.length > 0) {
                // Runtime Distribution
                const times = accepted.map((s: { timeConsumedMillis: number }) => s.timeConsumedMillis).sort((a: number, b: number) => a - b);
                const minTime = times[0];
                const maxTime = times[times.length - 1];
                const timeStep = Math.max(1, Math.ceil((maxTime - minTime) / 10)); // 10 buckets

                const runtimeDist = Array.from({ length: 10 }, (_, i) => {
                    const start = minTime + i * timeStep;
                    const end = start + timeStep;
                    const count = times.filter((t: number) => t >= start && t < end).length;
                    return {
                        label: `${start}-${end}ms`,
                        count,
                        isUser: true // User's own submissions
                    };
                });

                // Memory Distribution
                const mems = accepted.map((s: { memoryConsumedBytes: number }) => s.memoryConsumedBytes / 1024).sort((a: number, b: number) => a - b);
                const minMem = mems[0];
                const maxMem = mems[mems.length - 1];
                const memStep = Math.max(1, Math.ceil((maxMem - minMem) / 10));

                const memoryDist = Array.from({ length: 10 }, (_, i) => {
                    const start = minMem + i * memStep;
                    const end = start + memStep;
                    const count = mems.filter((m: number) => m >= start && m < end).length;
                    return {
                        label: `${Math.round(start)}-${Math.round(end)}KB`,
                        count,
                        isUser: true // User's own submissions
                    };
                });

                setStats({
                    totalSubmissions: mappedSubmissions.length,
                    runtimeDistribution: runtimeDist,
                    memoryDistribution: memoryDist,
                    userStats: null,
                });
            } else {
                setStats(null);
            }

        } catch (error: any) {
            console.error('Failed to load submissions', error?.message || error);
            setSubmissions([]);
            setStats(null);
        } finally {
            setSubmissionsLoading(false);
        }
    }, [contestId, problemId, cfHandle, handleLoading]);

    useEffect(() => {
        // Fetch on mount or tab change (only if handle is loaded)
        if ((activeTab === 'submissions' || activeTab === 'analytics') && !handleLoading) {
            fetchSubmissions();
        }
    }, [activeTab, fetchSubmissions, handleLoading]);

    // Navigation Base URL
    const navigationBaseUrl = getNavigationBaseUrl(contestId, urlType, groupId);

    // Loading State
    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#0B0B0C] flex flex-col items-center justify-center z-50 gap-4">
                <TestCasesLoader customText="Mirroring from Codeforces..." />
            </div>
        );
    }

    // Error State
    if (error || !problem || !cfData) {
        return (
            <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Mirror Failed</h2>
                    <p className="text-white/60 mb-6">{error || 'Problem not found'}</p>
                    <Link href="/" className="text-[#10B981] hover:underline">Return to Homepage</Link>
                </div>
            </div>
        );
    }


    return (
        <ExtensionGate>
            <ExtensionOnboardingModal />
            <div className="fixed inset-0 bg-[#0B0B0C] text-[#DCDCDC] z-50 flex flex-row">
                <SidebarTabs
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    currentUrl={`/contest/${contestId as string}/problem/${problemId}`}
                />

                <div className="flex-1 flex flex-col min-w-0">
                    <ProblemHeader
                        sheetId={contestId as string}
                        problem={cfData}
                        mobileView={mobileView}
                        setMobileView={setMobileView}
                        navigationBaseUrl={navigationBaseUrl}
                        problemId={problemId}
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />

                    <div ref={containerRef} className="flex-1 flex overflow-hidden" style={{ cursor: isResizing ? 'col-resize' : 'auto' }}>
                        {/* Left Panel */}
                        <ProblemLeftPanel
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isWhiteboardExpanded={isWhiteboardExpanded}
                            setIsWhiteboardExpanded={setIsWhiteboardExpanded}
                            cfData={cfData}
                            submissions={submissions}
                            submissionsLoading={submissionsLoading}
                            stats={stats}
                            cfStats={cfStats}
                            contestId={contestId}
                            problemId={problemId}
                            whiteboardHeight={whiteboardHeight}
                            handleWhiteboardResizeStart={handleWhiteboardResizeStart}
                            analyzeComplexity={analyzeComplexity}
                            complexityLoading={complexityLoading}
                            leftPanelRef={leftPanelRef as any}
                            lastWidth={lastWidth}
                            mobileView={mobileView}
                            cfHandle={cfHandle}
                            handleLoading={handleLoading}
                            onHandleSave={(handle) => {
                                setCfHandle(handle);
                                setTimeout(() => fetchSubmissions(), 100);
                            }}
                            userCode={code}
                            language={language}
                            // Deprecated: onSolveProblem={handleSolveProblem}
                            // New handlers for AI Tutor
                            onAiCodeUpdate={(newCode) => {
                                setAiCode(newCode);
                            }}
                            onSwitchToAiTab={() => {
                                setCodeTab('ai');
                                if (window.innerWidth < 768) {
                                    setMobileView('code');
                                }
                            }}
                            isGeneratingSolution={isGeneratingSolution}
                            selectedCode={selectedCode}
                            aiInitialQuestion={aiInitialQuestion}
                            onClearSelection={handleClearSelection}
                            selectedLineReference={selectedLineReference}
                        />

                        {/* Resizer */}
                        <div
                            className="hidden md:block w-1 bg-white/5 hover:bg-[#10B981]/50 cursor-col-resize transition-colors relative group shrink-0"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="absolute inset-y-0 -left-1 -right-1" />
                        </div>

                        {/* Right Panel (Workspace) */}
                        <CodeWorkspace
                            code={code}
                            setCode={setCode}
                            submitting={submitting}
                            onSubmit={handleSubmit}
                            onRunTests={runTests}
                            handleEditorDidMount={handleEditorDidMount}
                            isTestPanelVisible={isTestPanelVisible}
                            setIsTestPanelVisible={setIsTestPanelVisible}
                            testCases={testCases}
                            result={result}
                            cfStatus={cfStatus}
                            mobileView={mobileView}
                            language={language}
                            setLanguage={setLanguage}
                            contestId={contestId}
                            problemId={problemId}
                            testPanelActiveTab={testPanelActiveTab}
                            setTestPanelActiveTab={setTestPanelActiveTab}
                            onAddTestCase={handleAddTestCase}
                            onDeleteTestCase={handleDeleteTestCase}
                            onUpdateTestCase={handleUpdateTestCase}
                            sampleTestCasesCount={sampleTestCasesCount}
                            aiCode={aiCode}
                            activeTab={codeTab}
                            setActiveTab={setCodeTab}
                            onAskAboutCode={handleAskAboutCode}
                            onExplainLine={handleExplainLine}
                            onExplainFunction={handleExplainFunction}
                            onOptimizeCode={handleOptimizeCode}
                            onFindBugs={handleFindBugs}
                            activeLeftPanelTab={activeTab}
                        />
                    </div>

                    {/* Complexity Modal */}
                    <ComplexityModal
                        isOpen={showComplexityModal}
                        onClose={() => setShowComplexityModal(false)}
                        loading={complexityLoading}
                        result={complexityResult}
                    />

                    {!isTestPanelVisible && (
                        <button
                            onClick={() => setIsTestPanelVisible(true)}
                            className="fixed bottom-3 right-3 w-10 h-10 bg-[#10B981]/90 hover:bg-[#10B981] backdrop-blur-sm text-white rounded-full shadow-lg shadow-[#10B981]/10 hover:shadow-[#10B981]/20 active:scale-95 transition-all duration-200 flex items-center justify-center z-50 touch-manipulation border border-[#10B981]/20"
                            title="Show Test Cases"
                        >
                            <FlaskConical size={16} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        </ExtensionGate>
    );
}
