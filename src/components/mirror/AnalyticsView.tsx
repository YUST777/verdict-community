import { Loader2, BarChart2, Clock, HardDrive, Trophy, Tag, TrendingUp, Zap } from 'lucide-react';
import { AnalyticsStats } from './shared/types';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface AnalyticsViewProps {
    stats: AnalyticsStats | null;
    cfStats?: { rating?: number; solvedCount: number; tags?: string[] } | null;
    loading: boolean;
    analyzeComplexity: () => void;
    complexityLoading: boolean;
}

/* ── helpers ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#282828] border border-white/10 px-3 py-2 rounded-lg text-xs">
                <p className="text-[#999] mb-0.5">{label}</p>
                <p className="text-white font-medium">{payload[0].value} submissions</p>
            </div>
        );
    }
    return null;
};

function getRatingColor(rating: number): string {
    if (rating >= 2400) return 'text-red-500';
    if (rating >= 2100) return 'text-orange-400';
    if (rating >= 1900) return 'text-violet-400';
    if (rating >= 1600) return 'text-blue-400';
    if (rating >= 1400) return 'text-cyan-400';
    if (rating >= 1200) return 'text-[#2cbb5d]';
    return 'text-[#999]';
}

function getRatingBg(rating: number): string {
    if (rating >= 2400) return 'bg-red-500/10 border-red-500/20';
    if (rating >= 2100) return 'bg-orange-400/10 border-orange-400/20';
    if (rating >= 1900) return 'bg-violet-400/10 border-violet-400/20';
    if (rating >= 1600) return 'bg-blue-400/10 border-blue-400/20';
    if (rating >= 1400) return 'bg-cyan-400/10 border-cyan-400/20';
    if (rating >= 1200) return 'bg-[#2cbb5d]/10 border-[#2cbb5d]/20';
    return 'bg-white/5 border-white/10';
}

function getRatingLabel(rating: number): string {
    if (rating >= 2400) return 'Grandmaster';
    if (rating >= 2100) return 'Master';
    if (rating >= 1900) return 'Candidate Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Specialist';
    if (rating >= 1200) return 'Pupil';
    return 'Newbie';
}

function formatMemoryValue(kb: number): string {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)}`;
    return `${Math.round(kb)}`;
}

function formatMemoryUnit(kb: number): string {
    return kb >= 1024 ? 'MB' : 'KB';
}

/* ── component ── */

export default function AnalyticsView({ stats, cfStats, loading, analyzeComplexity, complexityLoading }: AnalyticsViewProps) {
    const showLocalStats = stats && stats.totalSubmissions > 0;

    if (!loading && !showLocalStats && !cfStats) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <img src="/icons/search-error.svg" alt="" className="w-20 h-20 opacity-40" draggable={false} />
                <div className="text-center">
                    <p className="text-sm text-[#555]">No analytics data yet</p>
                    <p className="text-xs text-[#444] mt-1">Submit a solution to see performance analysis</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-4">

            {/* ── Problem Info Card ── */}
            {cfStats && (
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
                        <Trophy size={14} className="text-[#666]" />
                        <span className="text-xs font-medium text-[#999]">Problem Info</span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
                        <div className="px-4 py-3.5">
                            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">Difficulty</p>
                            {cfStats.rating ? (
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-xl font-bold tabular-nums ${getRatingColor(cfStats.rating)}`}>
                                        {cfStats.rating}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${getRatingBg(cfStats.rating)} ${getRatingColor(cfStats.rating)}`}>
                                        {getRatingLabel(cfStats.rating)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-[#555]">Unrated</span>
                            )}
                        </div>
                        <div className="px-4 py-3.5">
                            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">Global Solves</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white tabular-nums">
                                    {cfStats.solvedCount >= 1000
                                        ? `${(cfStats.solvedCount / 1000).toFixed(cfStats.solvedCount >= 10000 ? 0 : 1)}K`
                                        : cfStats.solvedCount.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-[#555]">accepted</span>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {cfStats.tags && cfStats.tags.length > 0 && (
                        <div className="px-4 py-3 border-t border-white/[0.06]">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Tag size={10} className="text-[#555]" />
                                <span className="text-[10px] text-[#555] uppercase tracking-wider font-medium">Topics</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {cfStats.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 text-[10px] rounded-md bg-white/[0.04] text-[#888] border border-white/[0.06]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Skeleton: Performance Cards ── */}
            {loading && !showLocalStats && (
                <>
                    {/* Skeleton performance cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {[0, 1].map((i) => (
                            <div key={i} className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl px-4 py-3.5">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <div className="w-3 h-3 rounded-full bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                    <div className="h-2.5 w-14 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 150 + 50}ms` }} />
                                </div>
                                <div className="h-7 w-16 rounded-md bg-white/[0.08] animate-pulse mb-1" style={{ animationDelay: `${i * 150 + 100}ms` }} />
                                <div className="h-3.5 w-20 rounded-md bg-white/[0.04] animate-pulse mb-3" style={{ animationDelay: `${i * 150 + 150}ms` }} />
                                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-white/[0.06] rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Skeleton distribution chart */}
                    {[0, 1].map((chartIdx) => (
                        <div key={chartIdx} className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-white/[0.06] animate-pulse" style={{ animationDelay: `${chartIdx * 200}ms` }} />
                                    <div className="h-3 w-28 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${chartIdx * 200 + 50}ms` }} />
                                </div>
                                <div className="h-2.5 w-16 rounded-md bg-white/[0.04] animate-pulse" style={{ animationDelay: `${chartIdx * 200 + 100}ms` }} />
                            </div>
                            <div className="px-4 pt-4 pb-3">
                                {/* Skeleton bar chart */}
                                <div className="h-32 flex items-end gap-1.5 px-2">
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const heights = [35, 55, 70, 85, 95, 80, 60, 45, 30, 20, 15, 10];
                                        return (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-t-sm bg-white/[0.04] animate-pulse"
                                                style={{
                                                    height: `${heights[i % 12]}%`,
                                                    animationDelay: `${chartIdx * 200 + i * 60}ms`,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                {/* Skeleton x-axis labels */}
                                <div className="flex justify-between mt-2 px-1">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-2 w-8 rounded-sm bg-white/[0.04] animate-pulse" style={{ animationDelay: `${chartIdx * 200 + i * 80}ms` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* ── Performance Cards (Runtime + Memory side by side) ── */}
            {showLocalStats && stats!.userStats && (
                <div className="grid grid-cols-2 gap-3">
                    {/* Runtime Card */}
                    <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl px-4 py-3.5">
                        <div className="flex items-center gap-1.5 mb-3">
                            <Clock size={12} className="text-[#2cbb5d]" />
                            <span className="text-[10px] text-[#555] uppercase tracking-wider font-medium">Runtime</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-2xl font-bold text-white tabular-nums">
                                {stats!.userStats!.runtime.value}
                            </span>
                            <span className="text-xs text-[#555]">ms</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <TrendingUp size={10} className="text-[#2cbb5d]" />
                            <span className="text-xs text-[#2cbb5d] font-medium">
                                Beats {stats!.userStats!.runtime.percentile}%
                            </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#2cbb5d] rounded-full transition-all duration-700"
                                style={{ width: `${stats!.userStats!.runtime.percentile}%` }}
                            />
                        </div>
                    </div>

                    {/* Memory Card */}
                    <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl px-4 py-3.5">
                        <div className="flex items-center gap-1.5 mb-3">
                            <HardDrive size={12} className="text-[#5b8ff9]" />
                            <span className="text-[10px] text-[#555] uppercase tracking-wider font-medium">Memory</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-2xl font-bold text-white tabular-nums">
                                {formatMemoryValue(stats!.userStats!.memory.value)}
                            </span>
                            <span className="text-xs text-[#555]">{formatMemoryUnit(stats!.userStats!.memory.value)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <TrendingUp size={10} className="text-[#5b8ff9]" />
                            <span className="text-xs text-[#5b8ff9] font-medium">
                                Beats {stats!.userStats!.memory.percentile}%
                            </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#5b8ff9] rounded-full transition-all duration-700"
                                style={{ width: `${stats!.userStats!.memory.percentile}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Runtime Distribution Chart ── */}
            {showLocalStats && (
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <Clock size={13} className="text-[#666]" />
                            <span className="text-xs font-medium text-[#999]">Runtime Distribution</span>
                        </div>
                        <span className="text-[10px] text-[#555]">{stats!.totalSubmissions.toLocaleString()} accepted</span>
                    </div>
                    <div className="px-2 pt-4 pb-2">
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats!.runtimeDistribution} margin={{ top: 4, right: 8, bottom: 16, left: -24 }}>
                                    <XAxis
                                        dataKey="label"
                                        stroke="#333"
                                        fontSize={8}
                                        tickLine={false}
                                        axisLine={false}
                                        interval="preserveStartEnd"
                                        angle={-20}
                                        dy={8}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                        {stats!.runtimeDistribution.map((entry, index) => (
                                            <Cell
                                                key={`rt-${index}`}
                                                fill={entry.isUser ? '#2cbb5d' : '#2cbb5d'}
                                                fillOpacity={entry.isUser ? 1 : 0.15}
                                                stroke={entry.isUser ? '#2cbb5d' : 'transparent'}
                                                strokeWidth={entry.isUser ? 1.5 : 0}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        {stats!.userStats && (
                            <div className="flex items-center gap-4 justify-center pb-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm bg-[#2cbb5d]" />
                                    <span className="text-[10px] text-[#555]">You</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm bg-[#2cbb5d]/15" />
                                    <span className="text-[10px] text-[#555]">Others</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Memory Distribution Chart ── */}
            {showLocalStats && (
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <HardDrive size={13} className="text-[#666]" />
                            <span className="text-xs font-medium text-[#999]">Memory Distribution</span>
                        </div>
                        <span className="text-[10px] text-[#555]">Lower is better</span>
                    </div>
                    <div className="px-2 pt-4 pb-2">
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats!.memoryDistribution} margin={{ top: 4, right: 8, bottom: 16, left: -24 }}>
                                    <XAxis
                                        dataKey="label"
                                        stroke="#333"
                                        fontSize={8}
                                        tickLine={false}
                                        axisLine={false}
                                        interval="preserveStartEnd"
                                        angle={-20}
                                        dy={8}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                        {stats!.memoryDistribution.map((entry, index) => (
                                            <Cell
                                                key={`mem-${index}`}
                                                fill={entry.isUser ? '#5b8ff9' : '#5b8ff9'}
                                                fillOpacity={entry.isUser ? 1 : 0.15}
                                                stroke={entry.isUser ? '#5b8ff9' : 'transparent'}
                                                strokeWidth={entry.isUser ? 1.5 : 0}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        {stats!.userStats && (
                            <div className="flex items-center gap-4 justify-center pb-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm bg-[#5b8ff9]" />
                                    <span className="text-[10px] text-[#555]">You</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm bg-[#5b8ff9]/15" />
                                    <span className="text-[10px] text-[#555]">Others</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Analyze Complexity ── */}
            {showLocalStats && (
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Zap size={14} className="text-[#2cbb5d]" />
                            <div>
                                <p className="text-xs font-medium text-[#999]">Complexity Analysis</p>
                                <p className="text-[10px] text-[#555]">AI-powered time & space analysis</p>
                            </div>
                        </div>
                        <button
                            onClick={analyzeComplexity}
                            disabled={complexityLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2cbb5d]/10 hover:bg-[#2cbb5d]/15 border border-[#2cbb5d]/20 rounded-lg text-[11px] font-medium text-[#2cbb5d] transition-colors disabled:opacity-40"
                        >
                            {complexityLoading ? (
                                <Loader2 size={11} className="animate-spin" />
                            ) : (
                                <BarChart2 size={11} />
                            )}
                            Analyze
                        </button>
                    </div>
                </div>
            )}

            {/* ── No local submissions prompt ── */}
            {!showLocalStats && cfStats && (
                <div className="bg-[#1a1a1a] border border-dashed border-white/[0.08] rounded-xl px-4 py-8 text-center">
                    <p className="text-sm text-[#666]">Submit your solution to see performance data</p>
                    <p className="text-xs text-[#444] mt-1">
                        Compare against {cfStats.solvedCount.toLocaleString()} accepted solutions
                    </p>
                </div>
            )}
        </div>
    );
}