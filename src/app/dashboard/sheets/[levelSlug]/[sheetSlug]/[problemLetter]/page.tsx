'use client';

import { use, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { OnMount } from '@monaco-editor/react';
import Link from 'next/link';

import { ProblemHeader, ProblemLeftPanel } from '@/components/mirror/problem';
import { CodeWorkspace } from '@/components/mirror/editor';
import ProblemDrawer from '@/components/mirror/problem/ProblemDrawer';
import type { ActiveSheet } from '@/components/mirror/problem/ProblemDrawer';
import ExtensionGate from '@/components/core/ExtensionGate';
import { TestCasesLoader } from '@/components/ui/TestCasesLoader';

import { useProblemData } from '@/hooks/contest/useProblemData';
import { useCodePersistence } from '@/hooks/contest/useCodePersistence';
import { useCustomTestCases } from '@/hooks/contest/useCustomTestCases';
import { useResizableLayout } from '@/hooks/contest/useResizableLayout';
import { useWhiteboardResize } from '@/hooks/contest/useWhiteboardResize';
import { useCodeforcesSubmission } from '@/hooks/contest/useCodeforcesSubmission';
import { useLocalTestRunner } from '@/hooks/contest/useLocalTestRunner';
import { useCodeforcesHandle } from '@/hooks/contest/useCodeforcesHandle';

import type { CFProblemData, AnalyticsStats } from '@/components/mirror/shared/types';

export default function CurriculumProblemPage({ params }: { params: Promise<{ levelSlug: string; sheetSlug: string; problemLetter: string }> }) {
    const { levelSlug, sheetSlug, problemLetter: rawLetter } = use(params);
    const problemLetter = rawLetter.toUpperCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<any>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/curriculum/problem/${levelSlug}/${sheetSlug}/${problemLetter}`);
                if (!res.ok) { if (!cancelled) setError('Problem not found'); return; }
                const data = await res.json();
                if (!data?.problem) { if (!cancelled) setError('Problem not found'); return; }
                if (!cancelled) { setMeta(data.problem); setError(null); }
            } catch (e: any) {
                if (!cancelled) setError(e.message || 'Network error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [levelSlug, sheetSlug, problemLetter]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#0B0B0C] flex flex-col items-center justify-center z-50 gap-6">
                <TestCasesLoader />
            </div>
        );
    }

    if (error || !meta) {
        return (
            <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Problem Not Found</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <Link href={`/dashboard/sheets/${levelSlug}/${sheetSlug}`} className="text-emerald-400 hover:underline">Return to Sheet</Link>
                </div>
            </div>
        );
    }

    return (
        <MirrorUI
            contestId={meta.contestId}
            groupId={meta.groupId}
            problemId={problemLetter}
            levelSlug={levelSlug}
            sheetSlug={sheetSlug}
        />
    );
}

function MirrorUI({ contestId, groupId, problemId, levelSlug, sheetSlug }: {
    contestId: string; groupId: string; problemId: string; levelSlug: string; sheetSlug: string;
}) {
    const urlType = 'group';
    const navigationBaseUrl = `/dashboard/sheets/${levelSlug}/${sheetSlug}`;

    const { problem, cfData, loading, error, cfStats, sampleTestCases } = useProblemData({
        contestId, problemId, urlType, groupId
    });

    const { code, setCode, language, setLanguage } = useCodePersistence({ contestId, problemId });

    const sampleTestCasesCount = sampleTestCases.length;
    const { customTestCases, handleAdd, handleDelete, handleUpdate } = useCustomTestCases({
        contestId, problemId, sampleTestCasesCount
    });

    const testCases = useMemo(() => [...sampleTestCases, ...customTestCases], [sampleTestCases, customTestCases]);

    const { containerRef, leftPanelRef, handleMouseDown, lastWidth } = useResizableLayout();
    const { whiteboardHeight, handleResizeStart } = useWhiteboardResize();
    const { handle: cfHandle, setHandle: setCfHandle, loading: handleLoading } = useCodeforcesHandle();

    const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'analytics' | 'solution'>('description');
    const [mobileView, setMobileView] = useState<'problem' | 'code'>('problem');
    const [isTestPanelVisible, setIsTestPanelVisible] = useState(false);
    const [testPanelActiveTab, setTestPanelActiveTab] = useState<'testcase' | 'result' | 'codeforces'>('testcase');
    const [testPanelHeight, setTestPanelHeight] = useState(40);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeSheet, setActiveSheet] = useState<ActiveSheet | null>(null);
    const [showNotes, setShowNotes] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [quizMode, setQuizMode] = useState(false);

    const sheetProblems = activeSheet?.problems ?? [];

    const { cfStatus, handleSubmit, submitting: cfSubmitting } = useCodeforcesSubmission({
        code, language, contestId, problemId, urlType, groupId,
        setIsTestPanelVisible, setTestPanelActiveTab
    });

    const { result, runTests, submitting: testSubmitting } = useLocalTestRunner({
        code, language, testCases,
        timeLimit: cfData?.meta.timeLimitMs || 2000,
        memoryLimit: cfData?.meta.memoryLimitMB || 256,
        setIsTestPanelVisible, contestId, problemId
    });

    const submitting = cfSubmitting || testSubmitting;
    const editorRef = useRef<any>(null);
    const handleEditorDidMount: OnMount = (editor) => { editorRef.current = editor; };

    const fetchSubmissions = useCallback(async () => {
        setSubmissionsLoading(true);
        try {
            const p = new URLSearchParams({ problemId, contestId });
            const res = await fetch(`/api/submissions?${p}`, { credentials: 'include' });
            if (res.ok) { const d = await res.json(); setSubmissions(d.submissions || []); }
        } catch { /* */ }
        finally { setSubmissionsLoading(false); }
    }, [problemId, contestId]);

    useEffect(() => { if (activeTab === 'submissions') fetchSubmissions(); }, [activeTab, fetchSubmissions]);
    useEffect(() => { if (cfStatus?.status === 'done') fetchSubmissions(); }, [cfStatus?.status, fetchSubmissions]);

    const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

    if (loading || !problem || !cfData) {
        return (
            <div className="fixed inset-0 bg-[#0B0B0C] flex flex-col items-center justify-center z-50 gap-6">
                <TestCasesLoader />
            </div>
        );
    }

    return (
        <ExtensionGate>
            <div className="mirror-ui fixed inset-0 bg-[#0B0B0C] text-[#DCDCDC] z-50 flex flex-col" style={{ zoom: 0.85 }}>
                <ProblemDrawer
                    isOpen={isDrawerOpen}
                    onClose={closeDrawer}
                    currentContestId={contestId}
                    currentProblemId={problemId}
                    urlType={urlType}
                    groupId={groupId}
                    onSheetLoaded={setActiveSheet}
                    sheet={activeSheet}
                />

                <ProblemHeader
                    sheetId={sheetSlug}
                    problem={cfData}
                    mobileView={mobileView}
                    setMobileView={setMobileView}
                    navigationBaseUrl={navigationBaseUrl}
                    problemId={problemId}
                    onToggleSidebar={openDrawer}
                    onOpenDrawer={openDrawer}
                    sheetProblems={sheetProblems}
                    onSubmit={handleSubmit}
                    onRunTests={runTests}
                    submitting={submitting}
                    showNotes={showNotes}
                    setShowNotes={setShowNotes}
                />

                <div ref={containerRef} className="relative flex-1 flex overflow-hidden">
                    <ProblemLeftPanel
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isWhiteboardExpanded={false}
                            setIsWhiteboardExpanded={() => {}}
                            cfData={cfData}
                            submissions={submissions}
                            submissionsLoading={submissionsLoading}
                            stats={null}
                            cfStats={cfStats}
                            contestId={contestId}
                            problemId={problemId}
                            whiteboardHeight={whiteboardHeight}
                            handleWhiteboardResizeStart={handleResizeStart}
                            analyzeComplexity={() => {}}
                            complexityLoading={false}
                            leftPanelRef={leftPanelRef}
                            lastWidth={lastWidth}
                            mobileView={mobileView}
                            cfHandle={cfHandle}
                            handleLoading={handleLoading}
                            onHandleSave={setCfHandle}
                            userCode={code}
                            language={language}
                            showNotes={showNotes}
                            setShowNotes={setShowNotes}
                            onQuizMe={() => {
                                setQuizMode(!quizMode);
                                if (!quizMode) setActiveTab('solution');
                            }}
                            quizMode={quizMode}
                        />

                    <div
                        className="hidden md:block w-1 bg-white/5 hover:bg-emerald-500/50 cursor-col-resize transition-colors relative group shrink-0"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="absolute inset-y-0 -left-1 -right-1" />
                    </div>

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
                        onAddTestCase={handleAdd}
                        onDeleteTestCase={handleDelete}
                        onUpdateTestCase={handleUpdate}
                        sampleTestCasesCount={sampleTestCasesCount}
                    />
                </div>
            </div>
        </ExtensionGate>
    );
}
