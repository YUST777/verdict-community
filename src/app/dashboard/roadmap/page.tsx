'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode2, ChevronRight, CheckCircle2, Lock } from 'lucide-react';

interface Sheet {
    id: string;
    letter: string;
    number: number;
    name: string;
    title: string;
    slug: string;
    totalProblems: number;
    solvedCount: number;
}

interface Level {
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

export default function RoadmapPage() {
    const [levels, setLevels] = useState<{ level: Level; sheets: Sheet[] }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const levelsRes = await fetch('/api/curriculum/levels', { credentials: 'include' });
                if (!levelsRes.ok) return;
                const levelsData = await levelsRes.json();
                const allLevels = levelsData.levels || [];

                const results = await Promise.all(
                    allLevels.map(async (l: any) => {
                        try {
                            const res = await fetch(`/api/curriculum/sheets/${l.slug}`, { credentials: 'include' });
                            if (!res.ok) return { level: l, sheets: [] };
                            const data = await res.json();
                            return { level: data.level || l, sheets: data.sheets || [] };
                        } catch { return { level: l, sheets: [] }; }
                    })
                );
                setLevels(results);
            } catch { /* */ }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-12 w-64 rounded-xl" />
                {[0, 1, 2].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-8 w-48 rounded" />
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-20 rounded-xl" />)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const totalSolved = levels.reduce((s, l) => s + l.sheets.reduce((ss, sh) => ss + sh.solvedCount, 0), 0);
    const totalProblems = levels.reduce((s, l) => s + l.sheets.reduce((ss, sh) => ss + sh.totalProblems, 0), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                        <FileCode2 className="text-emerald-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Training Roadmap</h1>
                        <p className="text-[#808080] text-sm">Your complete path from beginner to ICPC competitor</p>
                    </div>
                </div>
                {totalProblems > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#808080]">Overall Progress</span>
                            <span className="text-emerald-400 font-bold">{totalSolved}/{totalProblems} ({Math.round((totalSolved / totalProblems) * 100)}%)</span>
                        </div>
                        <div className="h-2.5 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${(totalSolved / totalProblems) * 100}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Levels */}
            {levels.map(({ level, sheets }, levelIdx) => {
                const lvlSolved = sheets.reduce((s, sh) => s + sh.solvedCount, 0);
                const lvlTotal = sheets.reduce((s, sh) => s + sh.totalProblems, 0);
                const lvlPct = lvlTotal > 0 ? Math.round((lvlSolved / lvlTotal) * 100) : 0;
                const isComplete = lvlPct === 100 && lvlTotal > 0;

                return (
                    <div key={level.slug || levelIdx}>
                        {/* Level header */}
                        <div className="flex items-center justify-between mb-3">
                            <Link href={`/dashboard/sheets/${level.slug}`} className="group flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${isComplete ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                    {level.slug?.replace('level-', '') || levelIdx}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {level.title || level.name}
                                    </h2>
                                    <p className="text-[10px] text-[#666]">{sheets.length} sheets · {lvlTotal} problems · {level.durationWeeks}w</p>
                                </div>
                            </Link>
                            <span className={`text-xs font-bold ${isComplete ? 'text-green-400' : lvlPct > 0 ? 'text-emerald-400' : 'text-[#444]'}`}>
                                {lvlPct}%
                            </span>
                        </div>

                        {/* Sheets row */}
                        {sheets.length === 0 ? (
                            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl text-[#666] text-sm">
                                <Lock size={14} /> Coming soon
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                                {sheets.map(sheet => {
                                    const pct = sheet.totalProblems > 0 ? Math.round((sheet.solvedCount / sheet.totalProblems) * 100) : 0;
                                    const done = pct === 100 && sheet.totalProblems > 0;
                                    return (
                                        <Link
                                            key={sheet.id || sheet.letter}
                                            href={`/dashboard/sheets/${level.slug}/${sheet.slug || sheet.id}`}
                                            className={`group rounded-lg border p-2.5 transition-all text-center ${done ? 'bg-green-500/5 border-green-500/20' : 'bg-[#0f0f0f] border-white/5 hover:border-emerald-500/30'}`}
                                        >
                                            <div className={`text-lg font-bold mb-0.5 ${done ? 'text-green-400' : 'text-white/60 group-hover:text-emerald-400'}`}>
                                                {sheet.letter}
                                            </div>
                                            <div className="text-[9px] text-[#666] truncate mb-1">{sheet.title || sheet.name}</div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-emerald-500/50'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="text-[8px] text-[#555] mt-0.5">{sheet.solvedCount}/{sheet.totalProblems}</div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
