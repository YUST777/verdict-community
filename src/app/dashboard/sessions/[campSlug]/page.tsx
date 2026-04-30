import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Play, FolderOpen } from 'lucide-react';
import { camps } from '@/lib/sessionData';

export default async function CampSessionsPage(props: { params: Promise<{ campSlug: string }> }) {
  const params = await props.params;
  const camp = camps.find(c => c.slug === params.campSlug);

  if (!camp) {
    notFound();
  }

  return (
    <div className="font-sans text-white space-y-8 animate-fade-in pb-12">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 md:p-8 border border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/10">
            <FolderOpen className="text-emerald-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F2F2F2]">{camp.title}</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">{camp.sessions.length} Exclusive Sessions</p>
          </div>
        </div>
        <p className="text-[#808080] text-sm leading-relaxed max-w-2xl">{camp.description}</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-[#F2F2F2] mb-4">Session Content</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {camp.sessions.map((session) => (
            <Link key={session.id} href={`/dashboard/sessions/${camp.slug}/${session.number}`} className="group">
              <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden h-full">
                <div className="bg-[#0f0f0f] rounded-[23px] relative overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 w-full overflow-hidden bg-[#1a1a1a]">
                    {session.thumbnail && (
                      <Image
                        src={session.thumbnail}
                        alt={session.title}
                        fill
                        className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-500">
                        <Play className="w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-colors translate-x-0.5" />
                      </div>
                    </div>
                    {session.tag && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/80 backdrop-blur-sm border border-white/10 text-white/50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          {session.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 p-5 pt-4 mt-auto">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-400 font-mono text-xs font-bold">SESSION {session.number}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {session.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[#808080] line-clamp-2 mb-4">{session.description}</p>

                    <div className="w-full relative overflow-hidden rounded-xl bg-[#161616] border border-white/5 group-hover:border-white/10 transition-all">
                      <div className="relative z-10 px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-white/90 group-hover:text-emerald-400 transition-colors">Start Session</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {camp.sessions.length === 0 && (
            <div className="col-span-full bg-[#0f0f0f] border border-white/10 rounded-3xl p-12 text-center">
              <p className="text-[#666]">No sessions available in this camp yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
