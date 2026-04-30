'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X, ChevronRight, Sparkles } from 'lucide-react';
import { devLogs, LogEntry } from '@/lib/content/devlog';

function DevLogEntry({ entry }: { entry: LogEntry }) {
    const formatDate = (d: string) => {
        try { return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(d)); }
        catch { return d; }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-16 pb-16 last:mb-0 last:pb-0 border-b border-white/5 last:border-0">
            <div className="w-full md:w-1/3">
                <div className="sticky top-24">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-sm">
                            <span className="text-black font-black text-[10px] uppercase tracking-tight">{entry.version_short}</span>
                        </div>
                        <div>
                            <div className="text-white font-semibold text-sm">{entry.category}</div>
                            <div className="text-[#666] text-xs font-medium">{formatDate(entry.date)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{entry.title}</h2>
                <div className="text-lg text-[#808080] mb-6 font-medium leading-tight">{entry.subtitle}</div>
                <p className="text-[#A0A0A0] leading-relaxed mb-6">{entry.description}</p>
                {entry.highlights && entry.highlights.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="text-[11px] font-bold text-[#666] uppercase tracking-widest mb-4">Technical Details</div>
                        <ul className="space-y-3 m-0 p-0 list-none">
                            {entry.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[#A0A0A0]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-[7px] shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    {h}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DevLogPage() {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return devLogs;
        const q = search.toLowerCase();
        return devLogs.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.subtitle.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            e.version_short.toLowerCase().includes(q) ||
            e.highlights?.some(h => h.toLowerCase().includes(q))
        );
    }, [search]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-[#808080] hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium hidden sm:inline">Back</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-20">
                    <h1 className="text-[56px] font-extrabold tracking-tight mb-8 leading-[1.1]">
                        Verdict <br />
                        <span className="bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent italic">Development log</span>
                    </h1>
                    <p className="text-xl text-[#808080] max-w-xl leading-relaxed font-medium mb-12">
                        The technical journey of building verdict.run — Egypt's ICPC training hub.
                    </p>

                    <div className="mt-8 max-w-xl relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search updates..."
                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {search && <p className="text-sm text-[#666] mt-4 px-1">Found {filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>}
                </div>

                <div className="pt-12 border-t border-white/5">
                    {filtered.length > 0 ? (
                        filtered.map(entry => <DevLogEntry key={entry.id} entry={entry} />)
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-[#666] text-lg">No results for "{search}"</p>
                            <button onClick={() => setSearch('')} className="mt-4 text-sm text-emerald-400 hover:underline">Clear search</button>
                        </div>
                    )}
                </div>

                <div className="mt-32 p-10 rounded-[2rem] bg-emerald-500 text-black overflow-hidden relative">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-black/60 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                                <Sparkles size={14} />
                                READY TO SOLVE?
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">Start Training</h2>
                            <p className="text-black/70 mt-2 max-w-md font-medium text-sm">
                                Access the full curriculum with 646+ problems across 3 levels.
                            </p>
                        </div>
                        <Link href="/dashboard/sheets" className="whitespace-nowrap px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl">
                            Get Started
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="mt-20 pt-8 border-t border-white/5 pb-12 px-6">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <span className="font-bold text-[#808080]">Verdict</span>
                    <span className="text-[#444] text-xs">Last update: April 30, 2026</span>
                </div>
            </footer>
        </div>
    );
}
