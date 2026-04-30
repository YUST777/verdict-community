'use client';

import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';

interface HeroSectionProps {
  firstName: string;
  sheetHref?: string;
  tagline?: string;
  university?: { name: string; shortName: string; slug: string } | null;
}

export function HeroSection({
  firstName,
  sheetHref = '/dashboard/sheets',
  tagline = 'Say Hello With C++ - keep the momentum going!',
  university,
}: HeroSectionProps) {
  return (
    <div className="flex-1">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Welcome back</p>
      <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-2 break-words max-w-full">
        Hey {firstName},<br />
        <span className="text-emerald-400">let&apos;s code.</span>
      </h1>
      {university && (
        <Link
          href={`/dashboard/rooms/${university.slug}`}
          className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors"
        >
          <Building2 size={12} />
          {university.name}
        </Link>
      )}
      <p className="text-white/50 mb-6">{tagline}</p>
      <Link
        href={sheetHref}
        className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:gap-3"
      >
        Continue Solving
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
