'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Lock } from 'lucide-react';

interface AchievementIconProps {
  imageSrc?: string | null;
  icon?: React.ReactNode;
  active: boolean;
  tier: 'emerald' | 'blue' | 'purple' | 'locked';
}

function AchievementIcon({ imageSrc, icon, active, tier }: AchievementIconProps) {
  const tiers: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    blue: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
    locked: 'bg-[#131313] text-gray-700 border-white/5',
  };

  return (
    <div className={`aspect-square rounded-2xl flex items-center justify-center relative group cursor-pointer transition-transform active:scale-95 hover:scale-105 overflow-hidden ${active ? `bg-gradient-to-br border ${tiers[tier]}` : tiers.locked}`}>
      {imageSrc ? (
        <>
          <Image src={imageSrc} alt="Achievement" fill sizes="25vw" className={`object-cover ${!active ? 'blur-md grayscale opacity-50' : ''}`} unoptimized />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <Lock className="w-8 h-8 text-white/70" strokeWidth={2} />
            </div>
          )}
        </>
      ) : (
        icon && <div className="w-5 h-5">{icon}</div>
      )}
      {active && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />}
    </div>
  );
}

interface AchievementsWidgetProps {
  profile?: {
    codeforces_data?: { rating?: string };
    codeforces_profile?: unknown;
    sheet_1_solved?: boolean;
    is_approval_unlocked?: boolean;
    achievements?: unknown[];
  } | Record<string, unknown>;
  user?: { id?: number; email?: string; role?: string };
}

export default function AchievementsWidget({ profile, user }: AchievementsWidgetProps) {
  const typedProfile = profile as {
    codeforces_data?: { rating?: string };
    is_approval_unlocked?: boolean;
    sheet_1_solved?: boolean;
    achievements?: unknown[];
  } | undefined;

  const codeforcesData = typedProfile?.codeforces_data;
  const codeforcesRating = codeforcesData?.rating ? parseInt(codeforcesData.rating, 10) : null;
  const is500PtsUnlocked = codeforcesRating !== null && codeforcesRating >= 500;
  const hasCodeforcesLinked = !!(profile as any)?.codeforces_profile || !!codeforcesData;
  const isInstructorUnlocked = user?.role === 'instructor' || user?.role === 'owner';
  const isSheet1Unlocked = typedProfile?.sheet_1_solved === true;
  const isApprovalUnlocked = typedProfile?.is_approval_unlocked === true;

  const achievements = [
    { id: 'welcome', imageSrc: '/images/achievements/WELCOME.webp', unlocked: true, rarity: 1 },
    { id: 'approval', imageSrc: '/images/achievements/done_approvalcamp.webp', unlocked: isApprovalUnlocked, rarity: 2 },
    { id: 'sheet-1', imageSrc: '/images/achievements/sheet1acheavment.webp', unlocked: isSheet1Unlocked, rarity: 2 },
    { id: '500pts', imageSrc: hasCodeforcesLinked ? '/images/achievements/500pts.webp' : null, unlocked: is500PtsUnlocked, rarity: 2 },
    { id: 'instructor', imageSrc: '/images/achievements/instructor.webp', unlocked: isInstructorUnlocked, rarity: 3 },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).sort((a, b) => b.rarity - a.rarity);
  const lockedAchievements = achievements.filter(a => !a.unlocked).sort((a, b) => b.rarity - a.rarity);

  let displayAchievements: typeof achievements = [];
  if (unlockedAchievements.length >= 4) {
    displayAchievements = unlockedAchievements.slice(0, 4);
  } else {
    const unlockedToShow = unlockedAchievements.slice(0, 3);
    const lockedToShow = lockedAchievements.slice(0, 4 - unlockedToShow.length);
    displayAchievements = [...unlockedToShow, ...lockedToShow];
  }

  const count = unlockedAchievements.length;
  const total = achievements.length;
  const progress = (count / total) * 100;

  return (
    <div className="space-y-4">
      <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
        <div className="bg-[#0f0f0f] rounded-[23px] p-5 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex justify-between items-end mb-5 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-white tracking-tight">{count}</span>
                <span className="text-gray-500 text-sm font-medium pt-2">/ {total} Unlocked</span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-2.5 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden border border-white/5">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6 relative z-10">
            {displayAchievements.map((ach) => (
              ach.imageSrc ? (
                <AchievementIcon key={ach.id} imageSrc={ach.imageSrc} active={ach.unlocked} tier={ach.unlocked ? 'emerald' : 'locked'} />
              ) : (
                <AchievementIcon key={ach.id} icon={<Lock />} active={false} tier="locked" />
              )
            ))}
          </div>

          <Link href="/dashboard/profile" className="w-full relative overflow-hidden rounded-xl bg-[#161616] border border-white/5 hover:bg-[#1a1a1a] hover:border-white/10 transition-all group/btn block">
            <div className="relative z-10 px-4 py-3 flex items-center justify-between">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold text-white group-hover/btn:text-emerald-400 transition-colors">View All Badges</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-white/5 group-hover/btn:border-emerald-500/30 group-hover/btn:bg-emerald-500/10 transition-all">
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover/btn:text-emerald-500" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
