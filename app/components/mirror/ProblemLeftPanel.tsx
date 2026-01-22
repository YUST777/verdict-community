import { CFProblemData, Submission, AnalyticsStats } from './types';
import { CFProblemDescription } from './CFProblemDescription';
import SubmissionsList from './SubmissionsList';
import AnalyticsView from './AnalyticsView';
import Whiteboard from './Whiteboard';
import ProblemTabs from './ProblemTabs';
import HandleInputSection from './HandleInputSection';

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
    onHandleSave
}: ProblemLeftPanelProps) {
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
                setActiveTab={setActiveTab}
                isWhiteboardExpanded={isWhiteboardExpanded}
                setIsWhiteboardExpanded={setIsWhiteboardExpanded}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                {activeTab === 'description' && cfData && <CFProblemDescription data={cfData} />}
                {activeTab === 'submissions' && (
                    <>
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
                    </>
                )}
                {activeTab === 'analytics' && (
                    <AnalyticsView
                        stats={stats}
                        cfStats={cfStats}
                        loading={submissionsLoading}
                        analyzeComplexity={analyzeComplexity}
                        complexityLoading={complexityLoading}
                    />
                )}
                {activeTab === 'solution' && (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <h3 className="text-2xl font-bold text-white mb-3">coming soon shhhh</h3>
                    </div>
                )}
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

