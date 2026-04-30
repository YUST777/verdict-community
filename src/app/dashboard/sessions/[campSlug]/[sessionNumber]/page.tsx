'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { camps } from '@/lib/sessionData';

export default function DashboardSessionDetail() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const campSlug = params.campSlug as string;
  const sessionNumber = params.sessionNumber as string;

  const [authChecked, setAuthChecked] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);

  const camp = camps.find(c => c.slug === campSlug);
  const session = camp?.sessions.find(s => s.number === sessionNumber);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAuthChecked(true), 0);
      if (!isAuthenticated) {
        router.replace('/register');
      } else if (session) {
        const entityId = `${campSlug}-${sessionNumber}`;
        fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ entityType: 'session', entityId }),
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => setViewCount(data?.views ?? null))
          .catch(() => {});
      }
    }
  }, [loading, isAuthenticated, router, campSlug, sessionNumber, session]);

  if (loading || !authChecked) {
    return <div className="min-h-screen bg-black p-6"><div className="max-w-3xl mx-auto space-y-4"><Skeleton className="h-8 w-48 rounded-lg" /><Skeleton className="h-4 w-72 rounded" /><Skeleton className="h-64 rounded-xl" /></div></div>;
  }
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black p-6"><div className="max-w-3xl mx-auto space-y-4"><Skeleton className="h-8 w-48 rounded-lg" /><Skeleton className="h-64 rounded-xl" /></div></div>;
  }

  if (!camp || !session) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
        <Link href="/dashboard/sessions" className="text-emerald-400 hover:underline">Return to Sessions</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
        <div className="mb-8 sm:mb-12">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            {session.tag || 'SESSION'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">{session.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-lg text-[#808080] max-w-2xl leading-relaxed">{session.description}</p>
            {viewCount !== null && (
              <div className="flex items-center gap-2 text-white/40 bg-white/5 px-3 py-1.5 rounded-full self-start sm:self-auto border border-white/5">
                <Eye size={16} />
                <span className="text-xs font-bold uppercase tracking-tighter">{viewCount} views</span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-12 sm:mb-16">
          {session.videoId ? (
            <div className="aspect-video w-full bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <iframe
                src={`https://drive.google.com/file/d/${String(session.videoId).includes('google.com') ? String(session.videoId).split('/d/')[1]?.split('/')[0] : session.videoId}/preview`}
                width="100%"
                height="100%"
                allow="autoplay; fullscreen"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
              <p className="text-white/20">No video available</p>
            </div>
          )}
          <div className="mt-4 px-2">
            <p className="text-[10px] text-white/30 flex items-center gap-2 font-bold uppercase tracking-wider">
              <Info className="w-4 h-4 text-emerald-400/50" />
              If video does not load, <a href={`https://drive.google.com/file/d/${session.videoId}/view?usp=sharing`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">watch on Drive</a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-12">
          <div className="h-px bg-white/5 flex-1" />
          <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Session Notes</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-emerald-400 prose-strong:text-white prose-code:text-emerald-400 prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10">
          {session.content}
        </article>
      </div>
    </div>
  );
}
