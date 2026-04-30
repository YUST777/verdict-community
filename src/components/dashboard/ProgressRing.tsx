'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProgressRingProps {
  progress: number;
  total: number;
  label?: string;
  size?: number;
  href?: string;
}

export function ProgressRing({ progress, total, label = 'Sheet', size = 220, href }: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const pct = total > 0 ? Math.min((animatedProgress / total) * 100, 100) : 0;
  const r = size / 2 - 22;
  const c = r * 2 * Math.PI;
  const offset = c - (pct / 100) * c;
  const center = size / 2;

  const content = (
    <div className="relative self-center lg:self-auto max-w-full">
      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl opacity-50 animate-pulse-slow" />

      <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={pct === 100 ? 'url(#ringGradComplete)' : 'url(#ringGrad)'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ringGradComplete" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {total > 0 ? (
            <>
              <span className="text-4xl sm:text-5xl font-bold text-white">{progress}</span>
              <span className="text-xs sm:text-sm text-white/40">of {total}</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-white/30">-</span>
              <span className="text-xs text-white/30">Start solving</span>
            </>
          )}
        </div>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-[#1a1a1a] border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium whitespace-nowrap max-w-[200px] truncate inline-block text-center">
            {label}
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="hover:scale-105 transition-transform duration-300">{content}</Link>;
  }
  return content;
}
