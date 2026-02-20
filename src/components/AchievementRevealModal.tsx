'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

// Real achievement metadata matching AchievementsWidget
const ACHIEVEMENT_META: Record<string, {
    name: string;
    desc: string;
    imageSrc: string;
    tier: 'common' | 'rare' | 'legendary';
}> = {
    welcome: {
        name: 'Welcome Badge',
        desc: 'Awarded for joining ICPC HUE community',
        imageSrc: '/images/achievements/WELCOME.webp',
        tier: 'common'
    },
    approval: {
        name: 'Approval Camp',
        desc: 'Complete all sessions of the Approval Camp',
        imageSrc: '/images/achievements/done_approvalcamp.webp',
        tier: 'rare'
    },
    'sheet-1': {
        name: 'Sheet 1 Solved',
        desc: 'Solve all problems in Sheet 1',
        imageSrc: '/images/achievements/sheet1acheavment.webp',
        tier: 'rare'
    },
    '500pts': {
        name: '500+ Rating',
        desc: 'Achieve 500+ rating on Codeforces',
        imageSrc: '/images/achievements/500pts.webp',
        tier: 'rare'
    },
    instructor: {
        name: 'Instructor',
        desc: 'Become an ICPC HUE instructor',
        imageSrc: '/images/achievements/instructor.webp',
        tier: 'legendary'
    }
};

interface AchievementRevealModalProps {
    achievement: {
        id: number;
        achievement_id: string;
        earned_at: string;
    };
    onClose: () => void;
    onClaim: (id: number) => void;
}

export function AchievementRevealModal({ achievement, onClose, onClaim }: AchievementRevealModalProps) {
    const [isAnimating, setIsAnimating] = useState(true);

    const meta = ACHIEVEMENT_META[achievement.achievement_id];

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Both X and Claim should mark as seen
    const handleDismiss = () => {
        onClaim(achievement.id);
        onClose();
    };

    // If we don't have metadata for this achievement, skip it
    // IMPORTANT: This check must be AFTER all hooks to follow React rules
    useEffect(() => {
        if (!meta) {
            onClose();
        }
    }, [meta, onClose]);

    // Don't render if no metadata
    if (!meta) {
        return null;
    }

    const tierColors: Record<string, { badge: string; glow: string }> = {
        common: { badge: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20', glow: 'bg-zinc-400' },
        rare: { badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20', glow: 'bg-blue-400' },
        legendary: { badge: 'text-amber-400 bg-amber-400/10 border-amber-400/20', glow: 'bg-amber-400' }
    };

    const tierStyle = tierColors[meta.tier] || tierColors.common;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Blurry Backdrop - semi-transparent with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                onClick={handleDismiss}
            />

            {/* Modal Container */}
            <div className={`relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl ${isAnimating ? 'animate-scale-in' : ''}`}>
                <div className="p-6 text-center">

                    {/* Header Badge */}
                    <div className={`inline-block px-3 py-1 ${tierStyle.badge} border rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-3`}>
                        {meta.tier}
                    </div>

                    <h2 className="text-xl font-black text-white mb-1">Achievement Unlocked</h2>
                    <p className="text-zinc-500 text-xs mb-5">A new milestone has been reached!</p>

                    {/* Achievement Image */}
                    <div className="relative mb-6">
                        <div
                            className="w-28 h-28 mx-auto rounded-2xl relative overflow-hidden border-2 border-white/10"
                        >
                            {/* Glow effect */}
                            <div
                                className={`absolute inset-0 ${tierStyle.glow} opacity-20 blur-xl`}
                            />

                            {/* Achievement Image */}
                            <Image
                                src={meta.imageSrc}
                                alt={meta.name}
                                fill
                                className="object-cover animate-float"
                            />
                        </div>
                    </div>

                    {/* Achievement Info */}
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 rounded-xl border border-zinc-800">
                            <h4 className="text-lg font-bold text-white mb-1">{meta.name}</h4>
                            <p className="text-zinc-400 text-sm">{meta.desc}</p>
                        </div>

                        {/* Earned Date */}
                        <div className="text-center py-2">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Earned</p>
                            <p className="text-white font-medium text-sm">
                                {new Date(achievement.earned_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Claim Button - Gold theme */}
                        <button
                            onClick={handleDismiss}
                            className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-black font-black rounded-xl transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(232,193,90,0.3)]"
                        >
                            Claim Achievement
                        </button>
                    </div>
                </div>

                {/* Close Button - also marks as seen */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Custom animations */}
            <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
        </div>
    );
}

// Export achievement metadata for use in other components
export { ACHIEVEMENT_META };
