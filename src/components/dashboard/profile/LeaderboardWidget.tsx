import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';

interface LeaderboardWidgetProps {
  sheetsRank: number | null;
}

export function LeaderboardWidget({ sheetsRank }: LeaderboardWidgetProps) {
  return (
    <div className="bg-[#121212] p-4 md:p-5 rounded-xl border border-white/5 flex-1 flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 relative z-10">
        <div className="flex gap-3">
          <div className="p-2 md:p-3 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0"><Trophy size={20} /></div>
          <div>
            <h4 className="font-bold text-[#F2F2F2] text-sm md:text-base">Global Rank</h4>
            <p className="text-xs text-[#A0A0A0]">Sheets Leaderboard</p>
          </div>
        </div>
        <Link href="/dashboard/leaderboard" className="text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1">
          View Full <ChevronRight size={12} />
        </Link>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex items-baseline gap-2">
          {sheetsRank ? (
            <>
              <span className="text-4xl font-black text-white tracking-tight">#{sheetsRank}</span>
              <span className="text-sm text-[#666] font-medium">Current Position</span>
            </>
          ) : (
            <span className="text-sm text-[#666] italic">Not ranked yet</span>
          )}
        </div>
        <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden border border-white/5 mt-2">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full w-full opacity-50 animate-pulse" />
        </div>
        <p className="text-[10px] text-[#555] mt-2">Solve more problems to climb the ranks!</p>
      </div>
    </div>
  );
}
