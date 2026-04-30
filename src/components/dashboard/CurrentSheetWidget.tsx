'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { CurrentSheet } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/Skeleton';

interface CurrentSheetWidgetProps {
  sheet: CurrentSheet | null;
  loading?: boolean;
}

export default function CurrentSheetWidget({ sheet, loading = false }: CurrentSheetWidgetProps) {
  if (loading) {
    return (
      <div className="bg-[#121212] rounded-xl border border-white/5 p-6 h-full min-h-[320px] space-y-4">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="bg-[#121212] rounded-xl border border-white/5 p-6 h-full flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="p-3 bg-emerald-500/10 rounded-xl mb-3">
          <Sparkles className="text-emerald-400" size={24} />
        </div>
        <h3 className="text-lg font-bold text-[#F2F2F2] mb-1">No Sheet Started Yet</h3>
        <p className="text-xs text-[#666] mb-4">Start solving problems to track your progress here.</p>
        <Link href="/dashboard/sheets" className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-colors">
          Browse Sheets
        </Link>
      </div>
    );
  }

  const pct = sheet.totalProblems > 0 ? Math.round((sheet.solvedCount / sheet.totalProblems) * 100) : 0;
  const isComplete = pct === 100;
  const href = `/dashboard/sheets/${sheet.levelSlug}/${sheet.slug}`;

  return (
    <div className="space-y-0 h-full flex flex-col">
      <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden flex-1">
        <div className="bg-[#0f0f0f] rounded-[23px] relative overflow-hidden h-full flex flex-col">
          <div className="relative flex-1 w-full min-h-[180px] group-hover:scale-105 transition-transform duration-700">
            <Image src="/images/sheet/sheet1.webp" alt={`Sheet ${sheet.letter}`} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
          </div>

          <div className="absolute top-0 left-0 p-5 z-10 w-full">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-wider">Current Sheet</h2>
            </div>
          </div>

          <div className="relative z-10 p-5 pt-0 mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg border shrink-0 ${isComplete ? 'bg-green-500/15 border-green-500/30' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <span className={`font-bold text-lg ${isComplete ? 'text-green-400' : 'text-emerald-400'}`}>{sheet.letter}</span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Sheet {sheet.letter}: {sheet.name}</h3>
                <p className="text-gray-400 text-xs">{sheet.totalProblems} Problems • {sheet.levelName}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#666]">{sheet.solvedCount}/{sheet.totalProblems} solved</span>
                <span className={`text-xs font-bold ${isComplete ? 'text-green-400' : pct > 0 ? 'text-emerald-400' : 'text-[#444]'}`}>{pct}%</span>
              </div>
              <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            <Link href={href} className="w-full relative overflow-hidden rounded-xl bg-[#161616] border border-white/5 hover:bg-[#1a1a1a] hover:border-emerald-500/20 transition-all group/btn block">
              <div className="relative z-10 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover/btn:text-emerald-400 transition-colors">{isComplete ? 'Completed ✓' : 'Continue Solving'}</span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover/btn:text-emerald-400 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
