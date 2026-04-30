'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode2, Info, X, ChevronRight, Loader2 } from 'lucide-react';

export default function SheetsPage() {
    const [levels, setLevels] = useState<any[]>([]);
    const [progress, setProgress] = useState<Record<string, { solved: number; total: number }>>({});
    const [loading, setLoading] = useState(true);
    const [showCredits, setShowCredits] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch levels and progress in parallel
                const [levelsRes, progressRes] = await Promise.all([
                    fetch('/api/curriculum/levels', { credentials: 'include' }),
                    fetch('/api/curriculum/progress', { credentials: 'include' }),
                ]);

                if (levelsRes.ok) {
                    const levelsData = await levelsRes.json();
                    if (levelsData?.levels) {
                        const mappedLevels = levelsData.levels.map((l: any) => ({
                            id: l.slug,
                            slug: l.slug,
                            name: l.name,
                            description: l.description,
                            totalProblems: l.total_problems,
                            duration: `${l.duration_weeks} weeks`,
                            levelNumber: l.level_number
                        }));
                        setLevels(mappedLevels);
                    }
                }

                if (progressRes.ok) {
                    const progressData = await progressRes.json();
                    setProgress(progressData.progress || {});
                }
            } catch (error) {
                console.error('Failed to fetch curriculum data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Skeleton loader
    if (loading) {
        return (
            <div className="space-y-8">
                <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-white/5 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-white/5" />
                        <div className="space-y-2">
                            <div className="h-8 w-56 rounded-lg bg-white/5" />
                            <div className="h-4 w-72 rounded bg-white/5" />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-6 w-40 rounded bg-white/5" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 md:p-8 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <FileCode2 className="text-emerald-400" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#F2F2F2]">Training Curriculum</h1>
                                <p className="text-[#A0A0A0] text-sm mt-1">Your Roadmap to Competitive Programming</p>
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
                    <p className="text-[#808080] text-sm leading-relaxed max-w-2xl">
                        Access a comprehensive 3-level curriculum with 249+ problems designed to build your skills from the ground up.
                        Write code, submit solutions, and get instant feedback to accelerate your learning.
                    </p>
                </div>

                {/* Curriculum Levels */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[#F2F2F2]">Curriculum Levels</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {levels.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-white/40">No curriculum levels available yet.</p>
                                <p className="text-white/20 text-sm mt-2">Check back soon!</p>
                            </div>
                        ) : (
                            levels.map((level) => (
                                <Link
                                    key={level.id}
                                    href={`/dashboard/sheets/${level.slug}`}
                                    className="group"
                                >
                                    <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
                                        <div className="bg-[#0f0f0f] rounded-[23px] relative overflow-hidden h-full flex flex-col">
                                            {/* Gradient Header */}
                                            <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-emerald-500/20 to-blue-500/10">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-6xl font-black text-white/10">
                                                        {level.levelNumber}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                                            </div>

                                            <div className="relative z-10 p-5 pt-4 flex-1 flex flex-col">
                                                <div className="mb-3">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {level.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-400">
                                                        {level.totalProblems} Problems • {level.duration}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-[#808080] line-clamp-2 mb-4 flex-1">
                                                    {level.description}
                                                </p>

                                                <div className="w-full relative overflow-hidden rounded-xl bg-[#161616] border border-white/5 group-hover:border-white/10 transition-all">
                                                    <div className="relative z-10 px-4 py-3 flex items-center justify-between">
                                                        <span className="text-sm font-bold text-white/90 group-hover:text-emerald-400 transition-colors">
                                                            Explore Level
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                                                    </div>
                                                    {/* Progress Bar overlay */}
                                                    {progress[level.slug] && (
                                                        <div
                                                            className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-700"
                                                            style={{ width: `${(progress[level.slug].solved / Math.max(progress[level.slug].total, 1)) * 100}%` }}
                                                        />
                                                    )}
                                                </div>
                                                {progress[level.slug] && (
                                                    <div className="mt-2 flex justify-between px-1">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] text-[#666] font-bold">
                                                                {progress[level.slug].solved} Solved
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-[#444] font-bold">
                                                            {Math.round((progress[level.slug].solved / Math.max(progress[level.slug].total, 1)) * 100)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Credits Modal */}
            {showCredits && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCredits(false)}
                >
                    <div
                        className="bg-[#181818] border border-white/10 p-6 rounded-2xl max-w-md w-full relative shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors"
                            onClick={() => setShowCredits(false)}
                        >
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
        </>
    );
}
