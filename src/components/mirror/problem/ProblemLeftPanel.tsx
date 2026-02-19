import { CFProblemData, Submission, AnalyticsStats } from '../shared/types';
import { CFProblemDescription } from './CFProblemDescription';
import SubmissionsList from '../SubmissionsList';
import AnalyticsView from '../AnalyticsView';
import Whiteboard from '../Whiteboard';
import ProblemTabs from './ProblemTabs';
import HandleInputSection from '../HandleInputSection';
import AIAgentPanel from '../ai/AIAgentPanel';
// @ts-ignore
import { useAIAuth } from '@/lib/hooks/useAIAuth';
import { useRouter, usePathname } from 'next/navigation';

interface ProblemLeftPanelProps {
    activeTab: 'description' | 'submissions' | 'analytics' | 'solution';
    setActiveTab: (tab: 'description' | 'submissions' | 'analytics' | 'solution') => void;
    isWhiteboardExpanded: boolean;
    setIsWhiteboardExpanded: (expanded: boolean) => void;
    cfData: CFProblemData | null;
    submissions: Submission[];
    submissionsLoading: boolean;
    stats: AnalyticsStats | null;
    cfStats: { rating?: number; solvedCount: number } | null;
    contestId: string;
    problemId: string;
    whiteboardHeight: number;
    handleWhiteboardResizeStart: (e: React.MouseEvent) => void;
    analyzeComplexity: () => void;
    complexityLoading: boolean;
    leftPanelRef: React.RefObject<HTMLDivElement>;
    lastWidth: React.MutableRefObject<number>;
    mobileView: 'problem' | 'code';
    cfHandle: string | null;
    handleLoading: boolean;
    onHandleSave: (handle: string) => void;
    userCode: string;
    language: string;
    onSolveProblem?: () => void;
    isGeneratingSolution?: boolean;
    selectedCode?: string;
    aiInitialQuestion?: string;
    onClearSelection?: () => void;
    selectedLineReference?: string;
    onAiCodeUpdate?: (code: string) => void;
    onSwitchToAiTab?: () => void;
    autoStart?: boolean;
}

export default function ProblemLeftPanel({
    activeTab,
    setActiveTab,
    isWhiteboardExpanded,
    setIsWhiteboardExpanded,
    cfData,
    submissions,
    submissionsLoading,
    stats,
    cfStats,
    contestId,
    problemId,
    whiteboardHeight,
    handleWhiteboardResizeStart,
    analyzeComplexity,
    complexityLoading,
    leftPanelRef,
    lastWidth,
    mobileView,
    cfHandle,
    handleLoading,
    onHandleSave,
    userCode,
    language,
    onSolveProblem,
    isGeneratingSolution,
    selectedCode,
    aiInitialQuestion,
    onClearSelection,
    selectedLineReference,
    ...otherProps
}: ProblemLeftPanelProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading: authLoading } = useAIAuth();

    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
    const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

    return (
        <div
            ref={leftPanelRef}
            className={`problem-panel flex flex-col bg-[#121212] ${mobileView === 'code' ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}
            style={{
                '--panel-width': `${lastWidth.current}%`,
                willChange: 'width'
            } as React.CSSProperties}
        >
            <ProblemTabs
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    // UX: Automatically switch the editor to AI mode when opening the AI Tutor tab
                    if (tab === 'solution' && otherProps.onSwitchToAiTab) {
                        otherProps.onSwitchToAiTab();
                    }
                }}
                isWhiteboardExpanded={isWhiteboardExpanded}
                setIsWhiteboardExpanded={setIsWhiteboardExpanded}
            />

            <div className="flex-1 overflow-hidden">
                {activeTab === 'description' && (
                    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                        {cfData && <CFProblemDescription data={cfData} />}
                    </div>
                )}
                {activeTab === 'submissions' && (
                    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                        {!handleLoading && !cfHandle ? (
                            <div className="flex items-center justify-center py-12">
                                <HandleInputSection onSave={onHandleSave} compact />
                            </div>
                        ) : (
                            <SubmissionsList
                                submissions={submissions}
                                loading={submissionsLoading}
                                onViewCode={() => { }}
                                contestId={safeContestId}
                                problemIndex={safeProblemId}
                            />
                        )}
                    </div>
                )}
                {activeTab === 'analytics' && (
                    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                        <AnalyticsView
                            stats={stats}
                            cfStats={cfStats}
                            loading={submissionsLoading}
                            analyzeComplexity={analyzeComplexity}
                            complexityLoading={complexityLoading}
                        />
                    </div>
                )}
                {/* Keep AIAgentPanel mounted but hidden when inactive to allow auto-start and ghost typing */}
                <div className={activeTab === 'solution' ? 'h-full' : 'hidden'}>
                    <AIAgentPanel
                        onSolveProblem={onSolveProblem}
                        onAiCodeUpdate={otherProps.onAiCodeUpdate}
                        onSwitchToAiTab={otherProps.onSwitchToAiTab}
                        isLoading={isGeneratingSolution}
                        selectedCode={selectedCode}
                        userCode={userCode}
                        language={language}
                        problemDescription={cfData ? (() => {
                            let desc = `**Problem: ${cfData.meta.title}**\n\n`;
                            desc += `${cfData.story}\n\n`;
                            if (cfData.inputSpec) {
                                desc += `**Input Format:**\n${cfData.inputSpec}\n\n`;
                            }
                            if (cfData.outputSpec) {
                                desc += `**Output Format:**\n${cfData.outputSpec}\n\n`;
                            }
                            if (cfData.testCases && cfData.testCases.length > 0) {
                                desc += `**Examples:**\n\n`;
                                cfData.testCases.slice(0, 3).forEach((tc, idx) => {
                                    desc += `Example ${idx + 1}:\n`;
                                    desc += `Input:\n${tc.input}\n`;
                                    desc += `Output:\n${tc.output}\n\n`;
                                });
                            }
                            if (cfData.note) {
                                desc += `**Note:**\n${cfData.note}\n\n`;
                            }
                            return desc;
                        })() : undefined}
                        testCases={cfData?.testCases?.map(tc => ({ input: tc.input, output: tc.output })) || []}
                        initialQuestion={aiInitialQuestion}
                        codeforcesRating={cfStats?.rating}
                        problemTags={cfData?.tags || []}
                        problemDifficulty={cfData?.meta?.difficulty?.toString()}
                        onSelectionCleared={onClearSelection}
                        selectedLineReference={selectedLineReference}
                        autoStart={otherProps.autoStart}
                        problemId={`${safeContestId}-${safeProblemId}`}
                    />
                </div>
            </div>

            {/* Resizer Handle for Whiteboard */}
            {isWhiteboardExpanded && (
                <div
                    className="h-1.5 bg-[#121212] hover:bg-[#10B981] cursor-row-resize transition-colors w-full shrink-0"
                    onMouseDown={handleWhiteboardResizeStart}
                />
            )}

            {/* Whiteboard Component at the bottom */}
            <Whiteboard
                contestId={contestId}
                problemIndex={problemId}
                isExpanded={isWhiteboardExpanded}
                onToggleExpand={() => setIsWhiteboardExpanded(!isWhiteboardExpanded)}
                height={whiteboardHeight}
            />
        </div>
    );
}

