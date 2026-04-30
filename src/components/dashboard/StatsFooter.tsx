'use client';

import { Flame, Target, Trophy } from 'lucide-react';

interface StatsFooterProps {
  streak: number;
  totalSolved: number;
  rank: string;
  loading: boolean;
  studentId?: string;
}

export function StatsFooter({ streak, totalSolved, rank, loading, studentId }: StatsFooterProps) {
  void studentId;
  return (
    <div className="flex flex-col gap-4 mt-6 border-t border-white/5 pt-4">
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg" title={streak === 0 ? 'Start your streak today!' : 'Keep it going!'}>
          <Flame size={14} className="text-emerald-500 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white">{loading ? '-' : streak}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">Streak</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg" title="Total unique problems solved">
          <Target size={14} className="text-blue-500 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white">{loading ? '-' : totalSolved}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">Solved</span>
          </div>
        </div>

        <div className="col-span-2 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg" title="Codeforces rating">
          <Trophy size={14} className="text-emerald-400 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-white">{rank}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">Rank</span>
          </div>
        </div>
      </div>
    </div>
  );
}
