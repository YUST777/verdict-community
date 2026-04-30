'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Radio, Calendar, ArrowRight, ThumbsUp, Heart, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const newsItems = [
  {
    id: 'devlog',
    type: 'DevLog',
    title: 'Development Log',
    date: 'Jan 2, 2026',
    body: 'Explore the complete evolution of ICPC HUE - from genesis to the fully-featured judge system.',
    image: '/News/devlog.webp',
    featured: true,
    link: '/devlog',
  },
  {
    id: 'pro1-camp',
    type: 'Camp',
    title: 'Programming 1 Camp is Live',
    date: 'Jan 1, 2026',
    body: 'Join our intensive Programming 1 Camp. Sessions are live now.',
    image: '/images/lessons/pro1/pro1camp.webp',
    featured: true,
    link: '/dashboard/sessions/programming1/1',
  },
  {
    id: 'recap-2025',
    type: 'Recap',
    title: 'Your 2025 Wrapped is Here!',
    date: 'Dec 29, 2025',
    body: 'Check out your personal coding journey, total problems solved, and achievements unlocked in 2025.',
    image: '/News/2025recap.webp',
    featured: true,
    link: '/dashboard',
  },
  {
    id: 'dec-report',
    type: 'Community',
    title: 'December 2025 Report',
    date: 'Dec 28, 2025',
    body: 'See how our community grew in our first month.',
    image: '/News/decreport.webp',
    featured: true,
    link: '/2025/dec',
  },
  {
    id: 'sheet-1-launch',
    type: 'Training',
    title: 'Sheet 1 Has Arrived!',
    date: 'Dec 24, 2025',
    body: 'Sheet 1 is now live. Go solve it now and climb the leaderboard.',
    image: '/images/sheet/sheet1.webp',
    featured: true,
    link: '/dashboard/sheets',
  },
  {
    id: 'welcome-announce',
    type: 'Announcement',
    title: 'Welcome to ICPC HUE!',
    date: 'Jan 2025',
    body: 'Welcome to our training platform. Start with Sheet 1 and join the journey.',
    featured: false,
  },
];

function getTypeColor(type: string) {
  switch (type.toLowerCase()) {
    case 'training': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'announcement': return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'camp': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'recap': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'community': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'devlog': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    default: return 'bg-white/10 text-white border-white/30';
  }
}

export default function NewsPage() {
  const { profile, user } = useAuth();
  const studentId = (profile as any)?.student_id || user?.email?.split('@')[0];

  const dynamicNewsItems = newsItems.map(item => item.id === 'recap-2025' ? { ...item, link: studentId ? `/2025/${studentId}` : '/register' } : item);
  const featuredNewsItems = dynamicNewsItems.filter(n => n.featured);
  const otherNews = dynamicNewsItems.filter(n => !n.featured);

  const [reactions, setReactions] = useState<Record<string, { counts: { like: number; heart: number; fire: number }; userReactions: string[] }>>({});

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAllReactions = async () => {
      try {
        const ids = newsItems.map(item => item.id).join(',');
        const res = await fetch(`/api/news/reactions?newsIds=${ids}`, { credentials: 'include', signal: abortController.signal });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && !abortController.signal.aborted) setReactions(data);
        }
      } catch {
      }
    };
    fetchAllReactions();
    return () => abortController.abort();
  }, []);

  const handleReaction = async (newsId: string, reactionType: 'like' | 'heart' | 'fire') => {
    setReactions(prev => {
      const current = prev[newsId] || { counts: { like: 0, heart: 0, fire: 0 }, userReactions: [] };
      const hasReacted = current.userReactions.includes(reactionType);
      return {
        ...prev,
        [newsId]: {
          counts: { ...current.counts, [reactionType]: hasReacted ? current.counts[reactionType] - 1 : current.counts[reactionType] + 1 },
          userReactions: hasReacted ? current.userReactions.filter(r => r !== reactionType) : [...current.userReactions, reactionType],
        },
      };
    });

    await fetch('/api/news/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newsId, reactionType }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10"><Radio className="text-emerald-400" size={22} /></div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#F2F2F2]">Team News</h2>
      </div>

      <div className="space-y-6">
        {featuredNewsItems.map((featuredNews) => (
          <Link key={featuredNews.id} href={featuredNews.link || '#'} className="block group">
            <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-2xl border border-white/10 overflow-hidden hover:border-emerald-500/40 transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative w-full aspect-video md:h-auto overflow-hidden">
                  <Image src={featuredNews.image || ''} alt={featuredNews.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${getTypeColor(featuredNews.type)}`}>{featuredNews.type}</span>
                    <span className="flex items-center gap-1.5 text-xs text-[#666]"><Calendar size={12} />{featuredNews.date}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{featuredNews.title}</h3>
                  <p className="text-sm md:text-base text-[#888] leading-relaxed mb-6">{featuredNews.body}</p>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all"><span>Read More</span><ArrowRight size={16} /></div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                    {(['like', 'heart', 'fire'] as const).map((type) => {
                      const Icon = type === 'like' ? ThumbsUp : type === 'heart' ? Heart : Flame;
                      const count = reactions[featuredNews.id]?.counts[type] || 0;
                      const isActive = reactions[featuredNews.id]?.userReactions.includes(type) || false;
                      return (
                        <button
                          key={type}
                          onClick={(e) => { e.preventDefault(); handleReaction(featuredNews.id, type); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 scale-105' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/80 hover:scale-105'}`}
                        >
                          <Icon size={14} className={isActive ? 'fill-current' : ''} />
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherNews.map((news) => (
          <div key={news.id} className="bg-[#121212] p-5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${getTypeColor(news.type)}`}>{news.type}</span>
              <span className="flex items-center gap-1.5 text-xs text-[#555]"><Calendar size={11} />{news.date}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{news.title}</h3>
            <p className="text-sm text-[#777] leading-relaxed mb-4">{news.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
