'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play } from 'lucide-react';
import DemoModal from './DemoModal';

function HeroSection() {
    const [contestUrl, setContestUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const router = useRouter();

    const parseCodeforcesUrl = (url: string) => {
        if (!url) return null;
        const cleanUrl = url.split('?')[0].split('#')[0];

        // 1. Contest Problem
        const contestProblem = cleanUrl.match(/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if (contestProblem) return { type: 'contest', contestId: contestProblem[1], problemId: contestProblem[2].toUpperCase() };

        // 2. Gym Problem
        const gymProblem = cleanUrl.match(/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if (gymProblem) return { type: 'gym', contestId: gymProblem[1], problemId: gymProblem[2].toUpperCase() };

        // 3. Problemset
        const problemset = cleanUrl.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
        if (problemset) return { type: 'problemset', contestId: problemset[1], problemId: problemset[2].toUpperCase() };

        // 4. Contest Generic (includes /submit, /standings, root)
        const contestGeneric = cleanUrl.match(/contest\/(\d+)/i);
        if (contestGeneric) return { type: 'contest', contestId: contestGeneric[1], problemId: 'A' };

        // 5. Gym Generic
        const gymGeneric = cleanUrl.match(/gym\/(\d+)/i);
        if (gymGeneric) return { type: 'gym', contestId: gymGeneric[1], problemId: 'A' };

        return null;
    };

    const handleMirror = () => {
        const parsed = parseCodeforcesUrl(contestUrl.trim());
        if (parsed) {
            setIsLoading(true);
            const prefix = parsed.type === 'gym' ? 'gym' : parsed.type === 'problemset' ? 'problemset' : 'contest';
            router.push(`/${prefix}/${parsed.contestId}/problem/${parsed.problemId}`);
        }
    };

    return (
        <main className="relative z-10 flex-1 flex items-center justify-center py-20 pt-32 md:pt-20">

            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 w-full">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 md:mb-6 leading-tight">
                        Solve Problems
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Without Limits
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-8 md:mb-12 px-2">
                        Mirror Codeforces problems instantly. Code, test, and submit—all in one
                        beautiful interface that works everywhere.
                    </p>

                    <div className="max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all focus-within:border-emerald-500/50 focus-within:bg-white/10">
                            <input
                                type="text"
                                value={contestUrl}
                                onChange={(e) => setContestUrl(e.target.value)}
                                placeholder="Paste Codeforces problem URL..."
                                className="flex-1 px-5 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none text-base"
                            />
                            <button
                                onClick={handleMirror}
                                disabled={!parseCodeforcesUrl(contestUrl) || isLoading}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold rounded-xl transition-all hover:scale-105 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Mirror <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-3 px-1">
                            <p className="text-xs text-white/40 font-medium">
                                Supports: contest, gym, and problemset URLs
                            </p>

                            <button
                                onClick={() => setShowVideo(true)}
                                className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
                            >
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                                    <Play size={8} className="fill-current ml-0.5" />
                                </div>
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <DemoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
        </main>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(HeroSection);
