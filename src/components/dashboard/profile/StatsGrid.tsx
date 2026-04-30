interface StatsGridProps {
  rating: number | string;
  rank: string;
}

export function StatsGrid({ rating, rank }: StatsGridProps) {
  return (
    <div className="w-full mt-8 grid grid-cols-2 gap-3">
      <div className="bg-[#1A1A1A]/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 group/stat hover:bg-[#1A1A1A] transition-colors">
        <span className="text-2xl font-bold text-emerald-400 group-hover/stat:scale-110 transition-transform">{rating}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#666]">Rating</span>
      </div>
      <div className="bg-[#1A1A1A]/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 group/stat hover:bg-[#1A1A1A] transition-colors">
        <span className="text-xl font-bold text-white capitalize group-hover/stat:scale-110 transition-transform">{rank}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#666]">Rank</span>
      </div>
    </div>
  );
}
