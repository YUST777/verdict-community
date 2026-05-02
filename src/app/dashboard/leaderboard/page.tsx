'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink, Trophy, Code, Building2, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { addCacheBust } from '@/lib/cache-version';
import { fetchWithCache } from '@/lib/cache/api-cache';
import { useScope } from '@/hooks/useScope';
import { ScopeSelector } from '@/components/common/ScopeSelector';

const VirtualLeaderboard = dynamic(() => import('@/components/common/VirtualLeaderboard'), { ssr: false });

const MedalAnimation = ({ place }: { place: 1 | 2 | 3 }) => {
  if (place === 1) return <span className="text-xl">🥇</span>;
  if (place === 2) return <span className="text-xl">🥈</span>;
  return <span className="text-xl">🥉</span>;
};

interface CFUser {
  handle: string;
  name: string;
  rating: number;
  rank: string;
}

interface SheetUser {
  userId: number;
  username: string;
  universityShortName: string | null;
  solvedCount: number;
  totalSubmissions: number;
  acceptedCount: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { scope, setScope } = useScope();
  const [activeTab, setActiveTab] = useState<'codeforces' | 'sheets' | 'university'>('sheets');
  const [cfLeaderboard, setCfLeaderboard] = useState<CFUser[]>([]);
  const [sheetsLeaderboard, setSheetsLeaderboard] = useState<SheetUser[]>([]);
  const [uniLeaderboard, setUniLeaderboard] = useState<any[]>([]);
  const [uniName, setUniName] = useState<string>('');
  
  const userUniId = (user as any)?.university?.id;
  const userUniShortName = (user as any)?.university?.shortName;
  
  const [selectedUniId, setSelectedUniId] = useState<number | undefined>(undefined);

  // Initialize selectedUniId with user's uniId once it's available
  useEffect(() => {
    if (userUniId && !selectedUniId) {
      setSelectedUniId(userUniId);
    }
  }, [userUniId, selectedUniId]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'codeforces') {
          const data = await fetchWithCache<any>(addCacheBust('/api/leaderboard'), {}, 300);
          setCfLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        } else if (activeTab === 'university') {
          const targetUniId = selectedUniId || userUniId;
          if (targetUniId) {
            const data = await fetchWithCache<any>(`/api/leaderboard/university?scope=university&universityId=${targetUniId}`, { credentials: 'include' }, 300);
            setUniLeaderboard(data.leaderboard || []);
            setUniName(data.university?.name || '');
          } else {
            setUniLeaderboard([]);
          }
        } else {
          // Sheets tab — apply scope filter
          const targetUniId = selectedUniId || userUniId;
          const uniParam = scope === 'university' && targetUniId ? `universityId=${targetUniId}` : '';
          const data = await fetchWithCache<any>(addCacheBust(`/api/leaderboard/sheets?${uniParam}`), { credentials: 'include' }, 60);
          setSheetsLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, scope, selectedUniId, userUniId]);

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-500';
    if (rating >= 2100) return 'text-emerald-400';
    if (rating >= 1900) return 'text-purple-400';
    if (rating >= 1600) return 'text-blue-400';
    if (rating >= 1400) return 'text-cyan-400';
    if (rating >= 1200) return 'text-green-400';
    return 'text-gray-400';
  };

  const getSolvedBadge = (count: number) => {
    if (count >= 20) return 'bg-gradient-to-r from-emerald-500 to-green-500 text-black';
    if (count >= 10) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    if (count >= 5) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    return 'bg-[#333] text-[#A0A0A0]';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#F2F2F2] flex items-center gap-3">
            <Trophy className="text-emerald-400" size={28} />
            Leaderboard
          </h2>
          <p className="text-[#A0A0A0] mt-1 ml-10">Compare your progress with the community</p>
        </div>
        <ScopeSelector 
            scope={scope} 
            setScope={setScope} 
            universityName={userUniShortName} 
            selectedUniId={selectedUniId || userUniId}
            onUniChange={(id) => setSelectedUniId(id)}
        />
      </div>

      <div className="border-b border-white/10">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'sheets' ? 'text-emerald-400' : 'text-[#A0A0A0] hover:text-[#F2F2F2]'}`}
          >
            <div className="flex items-center gap-2"><Code size={16} />Training Sheets</div>
            {activeTab === 'sheets' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.3)]" />}
          </button>
          <button
            onClick={() => setActiveTab('codeforces')}
            className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'codeforces' ? 'text-emerald-400' : 'text-[#A0A0A0] hover:text-[#F2F2F2]'}`}
          >
            <div className="flex items-center gap-2"><ExternalLink size={16} />Codeforces Rating</div>
            {activeTab === 'codeforces' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.3)]" />}
          </button>
        </div>
      </div>

      <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden h-[600px] flex flex-col">
        {activeTab === 'sheets' ? (
          <>
            <div className={`grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-white/5 text-xs text-[#666] uppercase tracking-wider bg-[#121212] z-10 shrink-0`}>
              <div className="col-span-1">#</div>
              <div className="col-span-2 sm:col-span-4">Username</div>
              <div className="col-span-3 sm:col-span-2">Solved</div>
              <div className="hidden sm:block col-span-2">Accepted</div>
              <div className="hidden sm:block col-span-1">Subs</div>
              <div className="hidden sm:block col-span-2">University</div>
            </div>
            {loading ? (
              <div className="flex-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-white/[0.03]">
                    <div className="col-span-1"><Skeleton className="h-5 w-5 rounded-full mx-auto" /></div>
                    <div className="col-span-2 sm:col-span-4"><Skeleton className="h-4 w-3/4 rounded" /></div>
                    <div className="col-span-3 sm:col-span-2"><Skeleton className="h-5 w-10 rounded-full" /></div>
                    <div className="hidden sm:block col-span-2"><Skeleton className="h-4 w-8 rounded" /></div>
                    <div className="hidden sm:block col-span-1"><Skeleton className="h-4 w-4 rounded" /></div>
                    <div className="hidden sm:block col-span-2"><Skeleton className="h-4 w-12 rounded" /></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center flex flex-col items-center flex-1 justify-center">
                <h3 className="text-lg font-bold text-[#F2F2F2] mb-2">Failed to load leaderboard</h3>
                <p className="text-sm text-[#A0A0A0] max-w-md mx-auto mb-6">{error}</p>
              </div>
            ) : sheetsLeaderboard.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center flex-1 justify-center">
                <h3 className="text-lg font-bold text-[#F2F2F2] mb-2">No submissions yet</h3>
                <Link href="/dashboard/sheets" className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-600 transition-all">Start Solving</Link>
              </div>
            ) : (
              <VirtualLeaderboard items={sheetsLeaderboard} itemSize={56}>
                {({ index, style }: { index: number; style: React.CSSProperties }) => {
                  const user = sheetsLeaderboard[index];
                  return (
                    <Link
                      style={style}
                      key={user.userId}
                      href={`/profile/${user.userId}`}
                      className="grid grid-cols-6 sm:grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-white/5 transition-colors items-center border-b border-white/5 last:border-0"
                    >
                      <div className="col-span-1 flex items-center justify-center">{index < 3 ? <MedalAnimation place={(index + 1) as 1 | 2 | 3} /> : <span className="text-sm font-bold text-[#666]">{index + 1}</span>}</div>
                      <div className="col-span-2 sm:col-span-4 min-w-0">
                        <span className="text-sm font-medium text-[#F2F2F2] truncate block">{user.username}</span>
                      </div>
                      <div className="col-span-3 sm:col-span-2"><span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold ${getSolvedBadge(user.solvedCount)}`}>{user.solvedCount}</span></div>
                      <div className="hidden sm:block col-span-2 text-sm text-green-400 font-medium">{user.acceptedCount}</div>
                      <div className="hidden sm:block col-span-1 text-sm text-[#666]">{user.totalSubmissions}</div>
                      <div className="hidden sm:block col-span-2">
                        {user.universityShortName && (
                          <span className="text-xs text-[#A0A0A0] font-medium truncate max-w-full italic">{user.universityShortName}</span>
                        )}
                      </div>
                    </Link>
                  );
                }}
              </VirtualLeaderboard>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1fr_100px_120px] gap-2 px-3 sm:px-4 py-3 border-b border-white/5 text-xs text-[#666] uppercase tracking-wider bg-[#121212] z-10 shrink-0">
              <div>#</div><div>Handle</div><div className="text-right">Rating</div><div className="hidden sm:block">Rank</div>
            </div>
            {loading ? (
              <div className="flex-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1fr_100px_120px] gap-2 px-3 sm:px-4 py-3 border-b border-white/[0.03]">
                    <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-10 rounded ml-auto" />
                    <Skeleton className="h-4 w-16 rounded hidden sm:block" />
                  </div>
                ))}
              </div>
            ) : (
              <VirtualLeaderboard items={cfLeaderboard} itemSize={56}>
                {({ index, style }: { index: number; style: React.CSSProperties }) => {
                  const user = cfLeaderboard[index];
                  return (
                    <div style={style} key={user.handle} className="grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1fr_100px_120px] gap-2 px-3 sm:px-4 hover:bg-white/5 transition-colors items-center border-b border-white/5 last:border-0">
                      <div className="flex items-center justify-center">{index < 3 ? <MedalAnimation place={(index + 1) as 1 | 2 | 3} /> : <span className="text-sm font-bold text-[#666]">{index + 1}</span>}</div>
                      <div className="min-w-0">
                        <a href={`https://codeforces.com/profile/${user.handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#F2F2F2] hover:text-emerald-400 flex items-center gap-1.5 truncate">
                          <span className="truncate">{user.handle}</span>
                          <ExternalLink size={12} className="text-[#666] flex-shrink-0 hidden sm:inline" />
                        </a>
                        <p className="text-xs text-[#666] truncate hidden sm:block">{user.name}</p>
                      </div>
                      <div className={`text-sm font-bold text-right ${getRatingColor(user.rating)}`}>{user.rating}</div>
                      <div className="hidden sm:block text-sm text-[#A0A0A0] capitalize">{user.rank}</div>
                    </div>
                  );
                }}
              </VirtualLeaderboard>
            )}
          </>
        )}

        {activeTab === 'university' && (
          <>
            <div className="grid grid-cols-[40px_1fr_80px] sm:grid-cols-[40px_1fr_100px_100px] gap-2 px-3 sm:px-4 py-3 border-b border-white/5 text-xs text-[#666] uppercase tracking-wider bg-[#121212] z-10 shrink-0">
              <div>#</div><div>{uniName || 'University'}</div><div className="text-right">Solved</div><div className="hidden sm:block">CF Handle</div>
            </div>
            {loading ? (
              <div className="flex-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[40px_1fr_80px] gap-2 px-3 sm:px-4 py-3 border-b border-white/[0.03]">
                    <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-10 rounded ml-auto" />
                  </div>
                ))}
              </div>
            ) : uniLeaderboard.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center flex-1 justify-center">
                <Building2 size={32} className="text-[#333] mb-3" />
                <h3 className="text-lg font-bold text-[#F2F2F2] mb-2">No university data yet</h3>
                <p className="text-sm text-[#A0A0A0]">Solve problems to appear on your university leaderboard</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {uniLeaderboard.map((u: any, index: number) => (
                  <Link
                    key={u.userId}
                    href={`/profile/${u.handle || u.userId}`}
                    className="grid grid-cols-[40px_1fr_80px] sm:grid-cols-[40px_1fr_100px_100px] gap-2 px-3 sm:px-4 py-3 hover:bg-white/5 transition-colors items-center border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center justify-center">{index < 3 ? <MedalAnimation place={(index + 1) as 1 | 2 | 3} /> : <span className="text-sm font-bold text-[#666]">{index + 1}</span>}</div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-[#F2F2F2] truncate block">{u.username}</span>
                      <span className="text-[10px] text-[#666] truncate block">@{u.handle}</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-400 text-right">{u.solvedCount}</div>
                    <div className="hidden sm:block text-sm text-[#666] truncate">{u.codeforcesHandle || '—'}</div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
