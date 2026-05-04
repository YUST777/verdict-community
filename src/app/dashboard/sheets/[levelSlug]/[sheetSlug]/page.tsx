'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, XCircle, AlertTriangle, List, FileText,
    Filter, ArrowUpDown
} from 'lucide-react';

interface Problem {
    number: number;
    letter: string;
    title: string;
    codeforcesUrl: string;
    userStatus?: 'SOLVED' | 'ATTEMPTED' | null;
    solvedCount?: number;
}

interface SheetInfo {
    id: string;
    name: string;
    title: string;
    description: string;
    contestId: string;
    groupId: string;
    totalProblems: number;
}

interface LevelInfo {
    id: string;
    slug: string;
    name: string;
}

interface Submission {
    id: number;
    problemId: string;
    verdict: string;
    timeMs: number;
    memoryKb: number;
    submittedAt: string;
    attemptNumber?: number | null;
    language: string;
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className}`} />;
}

export default function SheetDetailPage({ params }: { params: Promise<{ levelSlug: string; sheetSlug: string }> }) {
    const resolvedParams = use(params);
    const { levelSlug, sheetSlug } = resolvedParams;
    const router = useRouter();

    const [level, setLevel] = useState<LevelInfo | null>(null);
    const [sheet, setSheet] = useState<SheetInfo | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'problems' | 'submissions'>('problems');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    // Filter/sort state
    const [verdictFilter, setVerdictFilter] = useState<'all' | 'accepted' | 'wrong'>('all');
    const [problemFilter, setProblemFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'time' | 'memory' | 'problem'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/curriculum/problems/${sheetSlug}?levelSlug=${levelSlug}`, { credentials: 'include' });
            if (!res.ok) { router.push(`/dashboard/sheets/${levelSlug}`); return; }
            const data = await res.json();
            setLevel(data.level);
            setSheet(data.sheet);
            setProblems(data.problems || []);
        } catch {
            router.push(`/dashboard/sheets/${levelSlug}`);
        } finally {
            setLoading(false);
        }
    }, [levelSlug, sheetSlug, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const fetchSubmissions = useCallback(async () => {
        if (!sheet?.id) return;
        setSubmissionsLoading(true);
        try {
            const res = await fetch(`/api/submissions?sheetId=${sheet.id}&limit=100`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions || []);
            }
        } catch { /* */ }
        finally { setSubmissionsLoading(false); }
    }, [sheet?.id]);

    useEffect(() => {
        if (activeTab === 'submissions' && sheet?.id) fetchSubmissions();
    }, [activeTab, sheet?.id, fetchSubmissions]);

    const filteredSubmissions = useMemo(() => {
        let result = [...submissions];
        if (verdictFilter === 'accepted') result = result.filter(s => s.verdict === 'Accepted');
        else if (verdictFilter === 'wrong') result = result.filter(s => s.verdict !== 'Accepted');
        if (problemFilter !== 'all') result = result.filter(s => s.problemId === problemFilter);
        result.sort((a, b) => {
            let c = 0;
            switch (sortBy) {
                case 'date': c = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(); break;
                case 'time': c = (a.timeMs || 0) - (b.timeMs || 0); break;
                case 'memory': c = (a.memoryKb || 0) - (b.memoryKb || 0); break;
                case 'problem': c = a.problemId.localeCompare(b.problemId); break;
            }
            return sortOrder === 'desc' ? -c : c;
        });
        return result;
    }, [submissions, verdictFilter, problemFilter, sortBy, sortOrder]);

    const uniqueProblems = useMemo(() => {
        return Array.from(new Set(submissions.map(s => s.problemId))).sort();
    }, [submissions]);

    const getVerdictStyle = (v: string) => {
        if (v === 'Accepted') return 'text-green-400';
        if (v.includes('Wrong')) return 'text-red-400';
        if (v.includes('Time')) return 'text-yellow-400';
        if (v.includes('Compilation')) return 'text-orange-400';
        if (v.includes('Runtime')) return 'text-purple-400';
        return 'text-gray-400';
    };

    const getVerdictIcon = (v: string) => {
        if (v === 'Accepted') return <CheckCircle2 size={14} className="text-green-400" />;
        if (v.includes('Wrong') || v.includes('Runtime')) return <XCircle size={14} className="text-red-400" />;
        return <AlertTriangle size={14} className="text-yellow-400" />;
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-40 rounded-lg" />
                            <Skeleton className="h-4 w-72 rounded" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-7 w-8 rounded" />
                            <div className="w-px h-10 bg-white/5" />
                            <Skeleton className="h-7 w-8 rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-2 w-full rounded-full mt-4" />
                </div>
                <div className="flex gap-2 border-b border-white/5 pb-px">
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-8 w-32 rounded" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!sheet || !level) return null;

    const solvedCount = problems.filter(p => p.userStatus === 'SOLVED').length;
    const pct = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-[#666] mb-2">
                                <Link href="/dashboard/sheets" className="hover:text-white transition-colors">Sheets</Link>
                                <span>/</span>
                                <Link href={`/dashboard/sheets/${levelSlug}`} className="hover:text-white transition-colors">{level.name}</Link>
                                <span>/</span>
                                <span className="text-emerald-400">{sheet.title || sheet.name}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#F2F2F2] mb-2">{sheet.title || sheet.name}</h1>
                            {sheet.description && <p className="text-[#808080] text-sm">{sheet.description}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-400">{solvedCount}</div>
                                <div className="text-xs text-[#666]">Solved</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#F2F2F2]">{problems.length}</div>
                                <div className="text-xs text-[#666]">Available</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#666] mb-1">
                            <span>Progress</span>
                            <span>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('problems')}
                        className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'problems'
                            ? 'text-emerald-400 border-emerald-400'
                            : 'text-[#666] border-transparent hover:text-[#A0A0A0]'
                        }`}
                    >
                        <List size={16} />
                        Problems
                    </button>
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'submissions'
                            ? 'text-emerald-400 border-emerald-400'
                            : 'text-[#666] border-transparent hover:text-[#A0A0A0]'
                        }`}
                    >
                        <FileText size={16} />
                        My Submissions
                        {submissions.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/10 rounded">{submissions.length}</span>
                        )}
                    </button>
                </div>

                {/* Problems Tab */}
                {activeTab === 'problems' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {problems.map((problem) => {
                            const isSolved = problem.userStatus === 'SOLVED';
                            const isAttempted = problem.userStatus === 'ATTEMPTED';
                            const url = problem.codeforcesUrl || `https://codeforces.com/group/${sheet.groupId}/contest/${sheet.contestId}/problem/${problem.letter}`;

                            return (
                                <Link
                                    key={problem.letter}
                                    href={`/dashboard/sheets/${levelSlug}/${sheetSlug}/${problem.letter}`}
                                    className={`relative group rounded-xl p-4 border transition-all text-center ${
                                        isSolved
                                            ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                                            : 'bg-[#121212] border-white/10 hover:border-emerald-500/30 hover:bg-[#161616]'
                                    }`}
                                >
                                    <div className={`text-2xl font-bold mb-1 ${
                                        isSolved ? 'text-green-400' : 'text-[#F2F2F2] group-hover:text-emerald-400'
                                    }`}>
                                        {problem.letter}
                                    </div>
                                    {isAttempted && !isSolved && (
                                        <div className="absolute top-2 right-2">
                                            <XCircle size={14} className="text-red-400" />
                                        </div>
                                    )}
                                    <div className="text-[10px] truncate text-[#808080]">
                                        {problem.title || `Problem ${problem.letter}`}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div className="bg-[#121212] rounded-xl border border-white/10 overflow-hidden">
                        {submissionsLoading ? (
                            <div className="p-4 space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto text-[#333] mb-3" size={48} />
                                <p className="text-[#666]">No submissions yet</p>
                                <p className="text-[#444] text-xs mt-1">Solve problems to see your submissions here</p>
                            </div>
                        ) : (
                            <>
                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/10 bg-[#0d0d0d]">
                                    <Filter size={16} className="text-[#666]" />
                                    <select
                                        value={verdictFilter}
                                        onChange={(e) => setVerdictFilter(e.target.value as any)}
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    >
                                        <option value="all">All Verdicts</option>
                                        <option value="accepted">✓ Accepted</option>
                                        <option value="wrong">✗ Wrong</option>
                                    </select>
                                    <select
                                        value={problemFilter}
                                        onChange={(e) => setProblemFilter(e.target.value)}
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    >
                                        <option value="all">All Problems</option>
                                        {uniqueProblems.map(p => <option key={p} value={p}>Problem {p}</option>)}
                                    </select>
                                    <div className="w-px h-6 bg-white/10" />
                                    <ArrowUpDown size={16} className="text-[#666]" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    >
                                        <option value="date">Date</option>
                                        <option value="time">Runtime</option>
                                        <option value="memory">Memory</option>
                                        <option value="problem">Problem</option>
                                    </select>
                                    <button
                                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white"
                                    >
                                        {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
                                    </button>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-[#666] text-left">
                                                <th className="px-4 py-3 font-medium">When</th>
                                                <th className="px-4 py-3 font-medium">Problem</th>
                                                <th className="px-4 py-3 font-medium">Verdict</th>
                                                <th className="px-4 py-3 font-medium">Time</th>
                                                <th className="px-4 py-3 font-medium">Memory</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubmissions.map((sub) => (
                                                <tr
                                                    key={sub.id}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-[#808080] whitespace-nowrap">{formatDate(sub.submittedAt)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-emerald-400 font-medium">{sub.problemId}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`flex items-center gap-1.5 font-medium ${getVerdictStyle(sub.verdict)}`}>
                                                            {getVerdictIcon(sub.verdict)}
                                                            {sub.verdict}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[#808080]">{sub.timeMs > 0 ? `${sub.timeMs} ms` : '-'}</td>
                                                    <td className="px-4 py-3 text-[#808080]">{sub.memoryKb > 0 ? `${Math.round(sub.memoryKb / 1024)} KB` : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </>
    );
}
