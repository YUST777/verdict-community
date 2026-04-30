'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarDay } from '@/hooks/useDashboardStats';

interface ActivityCalendarProps {
  weeks: CalendarDay[][];
  totalSubmissions: number;
  todayStr: string;
}

export function ActivityCalendar({ weeks, totalSubmissions, todayStr }: ActivityCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const submissionsInView = weeks.reduce((total, week) => total + week.reduce((weekTotal, day) => weekTotal + day.count, 0), 0);

  return (
    <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 p-5 overflow-hidden w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
        <span className="text-sm font-medium text-white">{submissionsInView} submissions in the last 3 months</span>
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <span>Less</span>
          {[0.1, 0.3, 0.5, 0.7, 1].map((o, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgba(16,185,129,${o})` }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 w-full">
        <div className="flex gap-1 min-w-fit px-1">
          <div className="flex flex-col gap-1 mr-2 text-[10px] text-white/30 sticky left-0 bg-[#0d0d0d] z-10 pr-2">
            <div className="h-2.5" />
            <div className="h-2.5 flex items-center">Mon</div>
            <div className="h-2.5" />
            <div className="h-2.5 flex items-center">Wed</div>
            <div className="h-2.5" />
            <div className="h-2.5 flex items-center">Fri</div>
            <div className="h-2.5" />
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(({ date, count }) => {
                const opacity = count === 0 ? 0.1 : count <= 1 ? 0.3 : count <= 2 ? 0.5 : count <= 4 ? 0.7 : 1;
                const isToday = date === todayStr;
                const isHovered = hoveredDate === date;
                const d = new Date(date);
                const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const submissionLabel = `${count} submission${count !== 1 ? 's' : ''}`;

                return (
                  <div key={date} className="relative" onMouseEnter={() => setHoveredDate(date)} onMouseLeave={() => setHoveredDate(null)}>
                    <div
                      className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-all hover:scale-125 ${isToday ? 'ring-1 ring-emerald-400' : ''}`}
                      style={{ backgroundColor: `rgba(16,185,129,${opacity})` }}
                    />

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 5 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                        >
                          <div className="px-3 py-2 rounded-lg border shadow-xl whitespace-nowrap flex flex-col items-center bg-[#171718] border-white/10">
                            <span className="text-xs font-semibold text-emerald-400">{submissionLabel}</span>
                            <span className="text-[10px] text-white/50">{displayDate}</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 border-r border-b rotate-45 bg-[#171718] border-white/10" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
