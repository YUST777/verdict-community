
import { Loader2, BarChart2, Clock, Sparkles, HardDrive, Database, Trophy } from 'lucide-react';
import { AnalyticsStats } from './types';
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
    cfStats?: { rating?: number; solvedCount: number } | null;
    loading: boolean;
    analyzeComplexity: () => void;
    complexityLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a] border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="text-white font-medium mb-1">{`Range: ${label}`}</p>
                <p className="text-[#34D399]">{`Count: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsView({ stats, cfStats, loading, analyzeComplexity, complexityLoading }: AnalyticsViewProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#10B981]" size={32} />
            </div>
        );
    }

    const showLocalStats = stats && stats.totalSubmissions > 0;

    if (!showLocalStats && !cfStats) {
        return (
            <div className="text-center py-16 text-[#666]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center border border-white/5">
                    <BarChart2 size={32} className="opacity-40" />
                </div>
                <p className="text-sm font-medium">No accepted submissions to analyze yet</p>
                <p className="text-xs text-[#444] mt-1">Submit a solution to see your analytics</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Codeforces Global Stats */}
            {cfStats && (
                <div className="relative rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl opacity-50" />

                    <div className="relative bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20">
                                <Trophy size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Global Stats</h3>
                                <p className="text-xs text-[#666]">Codeforces Community Data</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-[#666] mb-1">Difficulty Rating</p>
                                <p className="text-2xl font-bold text-white">
                                    {cfStats.rating ? (
                                        <span className={cfStats.rating >= 2000 ? 'text-red-400' : cfStats.rating >= 1500 ? 'text-blue-400' : 'text-green-400'}>
                                            {cfStats.rating}
                                        </span>
                                    ) : 'Unrated'}
                                </p>
                            </div>
                            <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-[#666] mb-1">Global Solves</p>
                                <p className="text-2xl font-bold text-[#34D399]">
                                    {cfStats.solvedCount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Local Stats */}
            {showLocalStats ? (
                <>
                    {/* Runtime Card */}
                    <div className="relative rounded-2xl overflow-hidden">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

                        <div className="relative bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                                        <Clock size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Runtime</h3>
                                        <p className="text-xs text-[#666]">{stats?.totalSubmissions ?? 0} submissions analyzed</p>
                                    </div>
                                </div>
                                <button onClick={analyzeComplexity} disabled={complexityLoading} className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/20 rounded-lg text-xs font-medium text-[#10B981] transition-all hover:scale-105 disabled:opacity-50">
                                    {complexityLoading ? <Loader2 size={12} className="animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
                                    Analyze Complexity
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-end gap-4 mb-6">
                                <div>
                                    <span className="text-4xl font-bold text-white tracking-tight">
                                        {stats!.userStats?.runtime.value ?? 0}
                                    </span>
                                    <span className="text-lg text-[#666] ml-1">ms</span>
                                </div>
                                {stats!.userStats?.runtime.percentile !== undefined && (
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-sm font-semibold text-emerald-400">
                                            Beats {Math.round(stats!.userStats.runtime.percentile)}%
                                        </span>
                                        <Sparkles size={16} className="text-emerald-400" />
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {stats!.userStats?.runtime.percentile !== undefined && (
                                <div className="mb-6">
                                    <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.round(stats!.userStats.runtime.percentile)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-[#444]">
                                        <span>Slower</span>
                                        <span>Faster</span>
                                    </div>
                                </div>
                            )}

                            {/* Chart */}
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats!.runtimeDistribution} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
                                        <XAxis
                                            dataKey="label"
                                            stroke="#444"
                                            fontSize={9}
                                            tickLine={false}
                                            axisLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                                            {stats!.runtimeDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.isUser ? '#10B981' : '#10B981'}
                                                    fillOpacity={entry.isUser ? 1 : 0.25}
                                                    stroke={entry.isUser ? '#10B981' : 'transparent'}
                                                    strokeWidth={entry.isUser ? 2 : 0}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Memory Card */}
                    <div className="relative rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />

                        <div className="relative bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20">
                                        <HardDrive size={20} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">Memory</h3>
                                        <p className="text-xs text-[#666]">Lower is better</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-end gap-4 mb-6">
                                <div>
                                    <span className="text-4xl font-bold text-white tracking-tight">
                                        {stats!.userStats?.memory.value ? Math.round(stats!.userStats.memory.value / 1024 * 10) / 10 : 0}
                                    </span>
                                    <span className="text-lg text-[#666] ml-1">MB</span>
                                </div>
                                {stats!.userStats?.memory.percentile !== undefined && (
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-sm font-semibold text-blue-400">
                                            Beats {Math.round(stats!.userStats.memory.percentile)}%
                                        </span>
                                        <Database size={16} className="text-blue-400" />
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {stats!.userStats?.memory.percentile !== undefined && (
                                <div className="mb-6">
                                    <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.round(stats!.userStats.memory.percentile)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-[#444]">
                                        <span>More Memory</span>
                                        <span>Less Memory</span>
                                    </div>
                                </div>
                            )}

                            {/* Chart */}
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats!.memoryDistribution} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
                                        <XAxis
                                            dataKey="label"
                                            stroke="#444"
                                            fontSize={9}
                                            tickLine={false}
                                            axisLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                                            {stats!.memoryDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.isUser ? '#3B82F6' : '#3B82F6'}
                                                    fillOpacity={entry.isUser ? 1 : 0.25}
                                                    stroke={entry.isUser ? '#3B82F6' : 'transparent'}
                                                    strokeWidth={entry.isUser ? 2 : 0}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] rounded-xl border border-white/5 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                                    <BarChart2 size={16} className="text-[#10B981]" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#666]">Total Submissions Analyzed</p>
                                    <p className="text-sm font-semibold text-white">{stats!.totalSubmissions}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-[#666] border border-dashed border-white/10 rounded-2xl">
                    <p className="text-sm">Submit your solution to generate runtime analysis</p>
                </div>
            )}
        </div>
    );
}
