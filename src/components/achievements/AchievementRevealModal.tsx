'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const ACHIEVEMENT_META: Record<string, { name: string; desc: string; imageSrc: string; tier: 'common' | 'rare' | 'legendary' }> = {
  welcome: {
    name: 'Welcome Badge',
    desc: 'Awarded for joining the community',
    imageSrc: '/images/achievements/WELCOME.webp',
    tier: 'common',
  },
  approval: {
    name: 'Approval Camp',
    desc: 'Complete all sessions of the Approval Camp',
    imageSrc: '/images/achievements/done_approvalcamp.webp',
    tier: 'rare',
  },
  'sheet-1': {
    name: 'Sheet 1 Solved',
    desc: 'Solve all problems in Sheet 1',
    imageSrc: '/images/achievements/sheet1acheavment.webp',
    tier: 'rare',
  },
  '500pts': {
    name: '500+ Rating',
    desc: 'Achieve 500+ rating on Codeforces',
    imageSrc: '/images/achievements/500pts.webp',
    tier: 'rare',
  },
  instructor: {
    name: 'Instructor',
    desc: 'Become an instructor',
    imageSrc: '/images/achievements/instructor.webp',
    tier: 'legendary',
  },
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

  const handleDismiss = () => {
    onClaim(achievement.id);
    onClose();
  };

  const hasSkippedNoMeta = useRef(false);
  useEffect(() => {
    if (!meta && !hasSkippedNoMeta.current) {
      hasSkippedNoMeta.current = true;
      onClose();
    }
  }, [meta, onClose]);

  if (!meta) return null;

  const tierColors: Record<string, { badge: string; glow: string }> = {
    common: { badge: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20', glow: 'bg-zinc-400' },
    rare: { badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20', glow: 'bg-blue-400' },
    legendary: { badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', glow: 'bg-emerald-400' },
  };
  const tierStyle = tierColors[meta.tier] || tierColors.common;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={handleDismiss} />

      <div className={`relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl ${isAnimating ? 'animate-scale-in' : ''}`}>
        <div className="p-6 text-center">
          <div className={`inline-block px-3 py-1 ${tierStyle.badge} border rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-3`}>
            {meta.tier}
          </div>
          <h2 className="text-xl font-black text-white mb-1">Achievement Unlocked</h2>
          <p className="text-zinc-500 text-xs mb-5">A new milestone has been reached.</p>

          <div className="relative mb-6">
            <div className="w-28 h-28 mx-auto rounded-2xl relative overflow-hidden border-2 border-white/10">
              <div className={`absolute inset-0 ${tierStyle.glow} opacity-20 blur-xl`} />
              <Image src={meta.imageSrc} alt={meta.name} fill className="object-cover animate-float" unoptimized />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-xl border border-zinc-800">
              <h4 className="text-lg font-bold text-white mb-1">{meta.name}</h4>
              <p className="text-zinc-400 text-sm">{meta.desc}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl transition-all active:scale-95"
            >
              Claim Achievement
            </button>
          </div>
        </div>

        <button onClick={handleDismiss} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
