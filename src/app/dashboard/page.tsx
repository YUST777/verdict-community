'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayName } from '@/lib/utils';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { ActivityCalendar } from '@/components/dashboard/ActivityCalendar';
import { StatsFooter } from '@/components/dashboard/StatsFooter';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const { stats, loading, calendarWeeks, todayStr, totalSubmissions } = useDashboardStats();
  const [forceShowTour, setForceShowTour] = useState(false);
  void forceShowTour;

  const displayName = getDisplayName((profile as any)?.name) || user?.email?.split('@')[0] || 'Member';
  const firstName = displayName.split(' ')[0];
  const rank = (profile as any)?.codeforces_data?.rank || 'Unrated';

  const sheet = stats.currentSheet;
  const progress = loading ? 0 : (sheet?.solvedCount ?? 0);
  const total = sheet?.totalProblems ?? 0;
  const sheetLabel = sheet ? `Sheet ${sheet.letter}: ${sheet.name}` : 'No sheet started';

  return (
    <div className="w-full max-w-[100vw] animate-fade-in space-y-5 pb-4 md:pb-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
        <HeroSection firstName={firstName} sheetHref={sheet ? `/dashboard/sheets/${sheet.levelSlug}/${sheet.slug}` : '/dashboard/sheets'} university={user?.university} />
        <ProgressRing
          progress={progress}
          total={total}
          label={sheetLabel}
          href={sheet ? `/dashboard/sheets/${sheet.levelSlug}/${sheet.slug}` : '/dashboard/sheets'}
        />
      </div>

      <ActivityCalendar weeks={calendarWeeks} totalSubmissions={totalSubmissions} todayStr={todayStr} />

      <div className="flex flex-col gap-4">
        <StatsFooter
          streak={stats.streak}
          totalSolved={stats.totalSolved}
          rank={rank}
          loading={loading}
          studentId={(profile as any)?.student_id}
        />

        <div className="flex justify-center pb-4">
          <button
            onClick={() => setForceShowTour(true)}
            className="text-xs text-white/30 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How to use the dashboard?
          </button>
        </div>
      </div>
    </div>
  );
}
