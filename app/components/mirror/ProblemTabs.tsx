import { FileText, History, BarChart2, Play, PenTool } from 'lucide-react';

interface ProblemTabsProps {
    activeTab: 'description' | 'submissions' | 'analytics' | 'solution';
    setActiveTab: (tab: 'description' | 'submissions' | 'analytics' | 'solution') => void;
    isWhiteboardExpanded: boolean;
    setIsWhiteboardExpanded: (expanded: boolean) => void;
}

export default function ProblemTabs({
    activeTab,
    setActiveTab,
    isWhiteboardExpanded,
    setIsWhiteboardExpanded
}: ProblemTabsProps) {
    return (
        <div className="flex border-b border-white/10 bg-[#1a1a1a] overflow-x-auto scrollbar-hide">
            <button
                onClick={() => setActiveTab('description')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium transition-colors touch-manipulation shrink-0 min-h-[44px] ${activeTab === 'description' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] active:text-[#A0A0A0]'}`}
            >
                <FileText size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Description</span>
            </button>
            <button
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium transition-colors touch-manipulation shrink-0 min-h-[44px] ${activeTab === 'submissions' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] active:text-[#A0A0A0]'}`}
            >
                <History size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Submissions</span>
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium transition-colors touch-manipulation shrink-0 min-h-[44px] ${activeTab === 'analytics' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] active:text-[#A0A0A0]'}`}
            >
                <BarChart2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Analytics</span>
            </button>
            <button
                onClick={() => setActiveTab('solution')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium transition-colors touch-manipulation shrink-0 min-h-[44px] ${activeTab === 'solution' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] active:text-[#A0A0A0]'}`}
            >
                <Play size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Solution</span>
            </button>
            <button
                onClick={() => setIsWhiteboardExpanded(!isWhiteboardExpanded)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium transition-colors border-l border-white/5 shrink-0 min-h-[44px] touch-manipulation ${isWhiteboardExpanded ? 'text-[#34D399] bg-[#1e1e1e]' : 'text-[#666] active:text-[#A0A0A0]'}`}
                title="Toggle Whiteboard"
            >
                <PenTool size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="whitespace-nowrap">Whiteboard</span>
            </button>
        </div>
    );
}

