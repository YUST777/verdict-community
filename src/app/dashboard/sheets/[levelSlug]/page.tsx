'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileCode2, ChevronRight, Info, X } from 'lucide-react';

interface DBSheet {
    id: string;
    letter: string;
    number: number;
    name: string;
    title: string;
    slug: string;
    description: string | null;
    contestId: string;
    contestUrl: string;
    groupId: string;
    totalProblems: number;
    solvedCount: number;
}

interface DBLevel {
    id: string;
    slug: string;
    name: string;
    title: string;
    description: string;
    durationWeeks: number;
    totalProblems: number;
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className}`} />;
}

export default function LevelOverviewPage({ params }: { params: Promise<{ levelSlug: string }> }) {
    const resolvedParams = use(params);
    const levelSlug = resolvedParams.levelSlug;
    const router = useRouter();

    const [level, setLevel] = useState<DBLevel | null>(null);
    const [sheets, setSheets] = useState<DBSheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCredits, setShowCredits] = useState(false);

    useEffect(() => {
        const fetchLevel = async () => {
            try {
                const res = await fetch(`/api/curriculum/sheets/${levelSlug}`, { credentials: 'include' });
                if (!res.ok) { router.push('/dashboard/sheets'); return; }
                const data = await res.json();
                if (data?.level) {
                    setLevel(data.level);
                    setSheets((data.sheets || []).map((s: any) => ({
                        ...s,
                        solvedCount: Number(s.solvedCount) || 0,
                        totalProblems: Number(s.totalProblems) || 0,
                    })));
                } else {
                    router.push('/dashboard/sheets');
                }
            } catch {
                router.push('/dashboard/sheets');
            } finally {
                setLoading(false);
            }
        };
        fetchLevel();
    }, [levelSlug, router]);

    const levelProgress = useMemo(() => {
        const totalSolved = sheets.reduce((sum, s) => sum + s.solvedCount, 0);
        const totalProblems = sheets.reduce((sum, s) => sum + s.totalProblems, 0);
        const percentage = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;
        return { totalSolved, totalProblems, percentage };
    }, [sheets]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-64 rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full max-w-lg rounded mb-5" />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-24 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                        </div>
                        <Skeleton className="h-2.5 w-full rounded-full" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-36 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-44 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!level) return null;

    return (
        <>
            <div className="space-y-8 animate-fade-in">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 md:p-8 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <FileCode2 className="text-emerald-400" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#F2F2F2]">{level.name}</h1>
                                <p className="text-[#A0A0A0] text-sm mt-1">{level.durationWeeks} weeks • {sheets.length} Sheets • {level.totalProblems} Problems</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCredits(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-bold self-start"
                        >
                            <Info size={16} />
                            <span>CREDITS</span>
                        </button>
                    </div>
                    <p className="text-[#808080] text-sm leading-relaxed max-w-2xl mb-5">
                        {level.description}
                    </p>

                    {levelProgress.totalProblems > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#A0A0A0]">Overall Progress</span>
                                <span className="text-xs font-bold text-emerald-400">
                                    {levelProgress.totalSolved}/{levelProgress.totalProblems} solved
                                    <span className="text-[#666] ml-1">({levelProgress.percentage.toFixed(0)}%)</span>
                                </span>
                            </div>
                            <div className="h-2.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-500 to-emerald-400"
                                    style={{ width: `${levelProgress.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sheets Grid */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#F2F2F2]">Training Sheets</h2>

                    {sheets.length === 0 ? (
                        <div className="text-center py-12 text-[#666]">
                            <p>No sheets available for this level yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {sheets.map((sheet) => {
                                const sheetPct = sheet.totalProblems > 0 ? (sheet.solvedCount / sheet.totalProblems) * 100 : 0;
                                const isComplete = sheetPct === 100;
                                const contestUrl = sheet.contestUrl || `https://codeforces.com/group/${sheet.groupId}/contest/${sheet.contestId}`;

                                return (
                                    <Link
                                        key={sheet.id || sheet.letter}
                                        href={`/dashboard/sheets/${levelSlug}/${sheet.slug || sheet.id}`}
                                        className={`group rounded-xl border transition-all p-4 ${isComplete
                                            ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                                            : 'bg-[#121212] border-white/10 hover:border-emerald-500/30 hover:bg-[#161616]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border text-sm ${isComplete
                                                ? 'bg-green-500/15 border-green-500/30'
                                                : 'bg-emerald-500/10 group-hover:bg-emerald-500/20 border-emerald-500/20'
                                            }`}>
                                                <span className={`font-bold ${isComplete ? 'text-green-400' : 'text-emerald-400'}`}>
                                                    {sheet.letter}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className={`font-bold text-sm transition-colors truncate ${isComplete
                                                    ? 'text-green-400'
                                                    : 'text-[#F2F2F2] group-hover:text-emerald-400'
                                                }`}>
                                                    {sheet.title || sheet.name}
                                                </h3>
                                                <p className="text-[10px] text-[#666]">{sheet.totalProblems} Problems</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] text-[#666]">
                                                    {sheet.solvedCount}/{sheet.totalProblems}
                                                </span>
                                                <span className={`text-[10px] font-bold ${isComplete ? 'text-green-400' : sheetPct > 0 ? 'text-emerald-400' : 'text-[#444]'}`}>
                                                    {sheetPct.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete
                                                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                                    }`}
                                                    style={{ width: `${sheetPct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Credits Modal */}
            {showCredits && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCredits(false)}>
                    <div className="bg-[#181818] border border-white/10 p-6 rounded-2xl max-w-md w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors" onClick={() => setShowCredits(false)}>
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                                <Info size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Acknowledgement</h3>
                            <p className="text-[#A0A0A0] text-sm leading-relaxed mb-4">
                                These training sheets are based on the excellent curriculum provided by:
                            </p>
                            <a
                                href="https://www.facebook.com/icpcassiutt/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-emerald-400 font-bold hover:underline bg-emerald-500/10 px-4 py-2 rounded-lg transition-colors hover:bg-emerald-500/20"
                            >
                                ICPC Assiut University Community
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </>
    );
}
