import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, History, Globe, Clock, MemoryStick, RefreshCw, ChevronRight, CheckCircle2, XCircle, AlertCircle, Timer } from 'lucide-react';
import { Submission } from './shared/types';

interface SubmissionsListProps {
    submissions: Submission[];
    loading: boolean;
    onViewCode: (id: number) => void;
    contestId?: string;
    problemIndex?: string;
}

interface GlobalSubmission {
    id: number;
    creationTimeSeconds: number;
    author: string;
    verdict: string;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
    language: string;
}

/* ── helpers ── */

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function timeAgoUnix(ts: number): string {
    const now = Date.now();
    const then = ts * 1000;
    const diff = Math.max(0, now - then);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(then).toLocaleDateString();
}

function formatMemory(kb: number): string {
    if (!kb) return '-';
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
}

function formatTime(ms: number): string {
    if (!ms && ms !== 0) return '-';
    return `${ms} ms`;
}

function formatVerdict(v: string): string {
    if (v === 'OK' || v === 'Accepted') return 'Accepted';
    if (v === 'WRONG_ANSWER') return 'Wrong Answer';
    if (v === 'TIME_LIMIT_EXCEEDED') return 'TLE';
    if (v === 'MEMORY_LIMIT_EXCEEDED') return 'MLE';
    if (v === 'RUNTIME_ERROR') return 'Runtime Error';
    if (v === 'COMPILATION_ERROR') return 'Compile Error';
    return v.replace(/_/g, ' ');
}

type VerdictType = 'accepted' | 'error' | 'pending';

function getVerdictType(v: string): VerdictType {
    if (v === 'Accepted' || v === 'OK') return 'accepted';
    if (v === 'TESTING' || v === 'PENDING') return 'pending';
    return 'error';
}

const verdictColors: Record<VerdictType, { text: string; bg: string; border: string }> = {
    accepted: { text: 'text-[#2cbb5d]', bg: 'bg-[#2cbb5d]/10', border: 'border-[#2cbb5d]/30' },
    error: { text: 'text-[#ef4743]', bg: 'bg-[#ef4743]/10', border: 'border-[#ef4743]/30' },
    pending: { text: 'text-[#ffa116]', bg: 'bg-[#ffa116]/10', border: 'border-[#ffa116]/30' },
};

/* ── component ── */

export default function SubmissionsList({ submissions, loading, onViewCode, contestId, problemIndex }: SubmissionsListProps) {
    const [mode, setMode] = useState<'local' | 'global'>('local');
    const [globalSubmissions, setGlobalSubmissions] = useState<GlobalSubmission[]>([]);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalError, setGlobalError] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const fetchGlobal = useCallback(async () => {
        if (!contestId) return;
        setGlobalLoading(true);
        setGlobalError(false);
        try {
            const res = await fetch(`/api/codeforces/submissions?contestId=${contestId}&problemIndex=${problemIndex}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setGlobalSubmissions(data);
            }
        } catch (err) {
            console.error('Failed to fetch global submissions', err);
            setGlobalError(true);
        } finally {
            setGlobalLoading(false);
        }
    }, [contestId, problemIndex]);

    useEffect(() => {
        if (mode === 'global' && globalSubmissions.length === 0) {
            fetchGlobal();
        }
    }, [mode, globalSubmissions.length, fetchGlobal]);

    return (
        <div className="flex flex-col h-full">
            {/* ── Tab Header ── */}
            <div className="flex items-center gap-0 border-b border-white/[0.06] mb-1">
                <button
                    onClick={() => setMode('local')}
                    className={`relative px-4 py-2.5 text-xs font-medium transition-colors ${
                        mode === 'local'
                            ? 'text-white'
                            : 'text-[#666] hover:text-[#999]'
                    }`}
                >
                    Your Submissions
                    {mode === 'local' && (
                        <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2cbb5d] rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setMode('global')}
                    className={`relative px-4 py-2.5 text-xs font-medium transition-colors ${
                        mode === 'global'
                            ? 'text-white'
                            : 'text-[#666] hover:text-[#999]'
                    }`}
                    disabled={!contestId}
                    title={!contestId ? 'Not available for this problem' : 'View global activity'}
                >
                    Global Feed
                    {mode === 'global' && (
                        <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2cbb5d] rounded-full" />
                    )}
                </button>

                {/* Refresh for global */}
                {mode === 'global' && (
                    <button
                        onClick={fetchGlobal}
                        className="ml-auto mr-2 p-1.5 text-[#666] hover:text-white rounded-md hover:bg-white/5 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={13} className={globalLoading ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {mode === 'local' ? (
                    <LocalSubmissions
                        submissions={submissions}
                        loading={loading}
                        onViewCode={onViewCode}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                    />
                ) : (
                    <GlobalFeed
                        submissions={globalSubmissions}
                        loading={globalLoading}
                        error={globalError}
                        onRetry={fetchGlobal}
                    />
                )}
            </div>
        </div>
    );
}

/* ── Local Submissions ── */

function LocalSubmissions({
    submissions,
    loading,
    onViewCode,
    hoveredId,
    setHoveredId,
}: {
    submissions: Submission[];
    loading: boolean;
    onViewCode: (id: number) => void;
    hoveredId: number | null;
    setHoveredId: (id: number | null) => void;
}) {
    if (loading) {
        return (
            <div className="py-1">
                {/* Skeleton table header */}
                <div className="grid grid-cols-[1fr_80px_80px_72px_28px] gap-2 px-4 py-2 text-[10px] font-medium text-[#555] uppercase tracking-wider">
                    <span>Status</span>
                    <span className="text-right">Runtime</span>
                    <span className="text-right">Memory</span>
                    <span className="text-right">Tests</span>
                    <span />
                </div>
                {/* Skeleton rows */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className={`grid grid-cols-[1fr_80px_80px_72px_28px] gap-2 items-center px-4 py-2.5 ${
                            i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                        }`}
                    >
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-white/[0.06] animate-pulse" />
                                <div className="h-3.5 rounded-md bg-white/[0.06] animate-pulse" style={{ width: `${70 + (i * 13) % 40}px`, animationDelay: `${i * 100}ms` }} />
                            </div>
                            <div className="h-2.5 w-14 rounded-md bg-white/[0.04] animate-pulse ml-[22px]" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                        </div>
                        <div className="flex justify-end">
                            <div className="h-3 w-10 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
                        </div>
                        <div className="flex justify-end">
                            <div className="h-3 w-12 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 100 + 150}ms` }} />
                        </div>
                        <div className="flex justify-end">
                            <div className="h-3 w-8 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 100 + 200}ms` }} />
                        </div>
                        <div className="w-3.5 h-3.5 rounded-sm bg-white/[0.04] animate-pulse" style={{ animationDelay: `${i * 100 + 250}ms` }} />
                    </div>
                ))}
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center">
                    <History size={20} className="text-[#555]" />
                </div>
                <p className="text-sm text-[#555]">No submissions yet</p>
                <p className="text-xs text-[#444]">Submit your solution to see results here</p>
            </div>
        );
    }

    return (
        <div className="py-1">
            {/* ── Table Header ── */}
            <div className="grid grid-cols-[1fr_80px_80px_72px_28px] gap-2 px-4 py-2 text-[10px] font-medium text-[#555] uppercase tracking-wider">
                <span>Status</span>
                <span className="text-right">Runtime</span>
                <span className="text-right">Memory</span>
                <span className="text-right">Tests</span>
                <span />
            </div>

            {/* ── Rows ── */}
            {submissions.map((sub, idx) => {
                const vType = getVerdictType(sub.verdict);
                const colors = verdictColors[vType];
                const isHovered = hoveredId === sub.id;

                return (
                    <div
                        key={sub.id}
                        onClick={() => onViewCode(sub.id)}
                        onMouseEnter={() => setHoveredId(sub.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`group grid grid-cols-[1fr_80px_80px_72px_28px] gap-2 items-center px-4 py-2.5 cursor-pointer transition-colors ${
                            isHovered ? 'bg-white/[0.03]' : idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                        }`}
                    >
                        {/* Status */}
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                                {vType === 'accepted' ? (
                                    <CheckCircle2 size={14} className="text-[#2cbb5d] shrink-0" />
                                ) : vType === 'pending' ? (
                                    <Timer size={14} className="text-[#ffa116] shrink-0" />
                                ) : (
                                    <XCircle size={14} className="text-[#ef4743] shrink-0" />
                                )}
                                <span className={`text-sm font-medium truncate ${colors.text}`}>
                                    {formatVerdict(sub.verdict)}
                                </span>
                            </div>
                            <span className="text-[10px] text-[#555] pl-[22px]">
                                {timeAgo(sub.submittedAt)}
                            </span>
                        </div>

                        {/* Runtime */}
                        <span className="text-xs text-[#999] text-right tabular-nums">
                            {formatTime(sub.timeMs)}
                        </span>

                        {/* Memory */}
                        <span className="text-xs text-[#999] text-right tabular-nums">
                            {formatMemory(sub.memoryKb)}
                        </span>

                        {/* Tests */}
                        <span className="text-xs text-right tabular-nums">
                            <span className={vType === 'accepted' ? 'text-[#2cbb5d]' : 'text-[#999]'}>
                                {sub.testsPassed}
                            </span>
                            <span className="text-[#444]">/{sub.totalTests}</span>
                        </span>

                        {/* Arrow */}
                        <ChevronRight
                            size={14}
                            className={`transition-all ${
                                isHovered ? 'text-[#999] translate-x-0.5' : 'text-[#333]'
                            }`}
                        />
                    </div>
                );
            })}
        </div>
    );
}

/* ── Global Feed ── */

function GlobalFeed({
    submissions,
    loading,
    error,
    onRetry,
}: {
    submissions: GlobalSubmission[];
    loading: boolean;
    error?: boolean;
    onRetry?: () => void;
}) {
    if (loading) {
        return (
            <div className="py-1">
                {/* Skeleton table header */}
                <div className="grid grid-cols-[1fr_90px_72px_72px] gap-2 px-4 py-2 text-[10px] font-medium text-[#555] uppercase tracking-wider">
                    <span>Author</span>
                    <span>Verdict</span>
                    <span className="text-right">Runtime</span>
                    <span className="text-right">Memory</span>
                </div>
                {/* Skeleton rows */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className={`grid grid-cols-[1fr_90px_72px_72px] gap-2 items-center px-4 py-2.5 ${
                            i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                        }`}
                    >
                        <div className="flex flex-col gap-1">
                            <div className="h-3.5 rounded-md bg-white/[0.06] animate-pulse" style={{ width: `${60 + (i * 17) % 50}px`, animationDelay: `${i * 80}ms` }} />
                            <div className="h-2.5 w-16 rounded-md bg-white/[0.04] animate-pulse" style={{ animationDelay: `${i * 80 + 40}ms` }} />
                        </div>
                        <div>
                            <div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 80 + 80}ms` }} />
                        </div>
                        <div className="flex justify-end">
                            <div className="h-3 w-10 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 80 + 120}ms` }} />
                        </div>
                        <div className="flex justify-end">
                            <div className="h-3 w-12 rounded-md bg-white/[0.06] animate-pulse" style={{ animationDelay: `${i * 80 + 160}ms` }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <img src="/icons/feature-error.svg" alt="" className="w-20 h-20 opacity-40" draggable={false} />
                <div className="text-center">
                    <p className="text-sm text-[#555]">Failed to load submissions</p>
                    <p className="text-xs text-[#444] mt-1">Codeforces API may be unavailable</p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2cbb5d]/10 hover:bg-[#2cbb5d]/15 border border-[#2cbb5d]/20 rounded-lg text-[11px] font-medium text-[#2cbb5d] transition-colors"
                    >
                        <RefreshCw size={11} />
                        Try again
                    </button>
                )}
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <img src="/icons/search-error.svg" alt="" className="w-20 h-20 opacity-40" draggable={false} />
                <div className="text-center">
                    <p className="text-sm text-[#555]">No submissions found</p>
                    <p className="text-xs text-[#444] mt-1">Be the first to solve it!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-1">
            {/* ── Table Header ── */}
            <div className="grid grid-cols-[1fr_90px_72px_72px] gap-2 px-4 py-2 text-[10px] font-medium text-[#555] uppercase tracking-wider">
                <span>Author</span>
                <span>Verdict</span>
                <span className="text-right">Runtime</span>
                <span className="text-right">Memory</span>
            </div>

            {/* ── Rows ── */}
            {submissions.map((sub, idx) => {
                const vType = getVerdictType(sub.verdict);
                const colors = verdictColors[vType];

                return (
                    <div
                        key={sub.id}
                        className={`group grid grid-cols-[1fr_90px_72px_72px] gap-2 items-center px-4 py-2.5 transition-colors hover:bg-white/[0.03] ${
                            idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                        }`}
                    >
                        {/* Author + Language */}
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium text-white truncate">
                                {sub.author}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#555]">{sub.language}</span>
                                <span className="text-[10px] text-[#444]">{timeAgoUnix(sub.creationTimeSeconds)}</span>
                            </div>
                        </div>

                        {/* Verdict pill */}
                        <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {vType === 'accepted' ? (
                                    <CheckCircle2 size={10} />
                                ) : vType === 'pending' ? (
                                    <Timer size={10} />
                                ) : (
                                    <XCircle size={10} />
                                )}
                                {formatVerdict(sub.verdict)}
                            </span>
                        </div>

                        {/* Runtime */}
                        <span className="text-xs text-[#999] text-right tabular-nums">
                            {sub.timeConsumedMillis} ms
                        </span>

                        {/* Memory */}
                        <span className="text-xs text-[#999] text-right tabular-nums">
                            {formatMemory(Math.round(sub.memoryConsumedBytes / 1024))}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}