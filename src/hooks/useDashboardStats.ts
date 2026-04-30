'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithCache } from '@/lib/cache/api-cache';

export interface CurrentSheet {
  id: string;
  letter: string;
  name: string;
  slug: string;
  levelSlug: string;
  levelName: string;
  totalProblems: number;
  solvedCount: number;
  lastActive: string;
}

export interface DashboardStats {
  streak: number;
  totalSolved: number;
  activity: Record<string, number>;
  currentSheet: CurrentSheet | null;
}

export interface CalendarDay {
  date: string;
  count: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    streak: 0,
    totalSolved: 0,
    activity: {},
    currentSheet: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchWithCache<any>('/api/user/dashboard-stats', { credentials: 'include' }, 60);
        setStats({
          streak: data.streak || 0,
          totalSolved: data.totalSolved || 0,
          activity: data.consistencyMap || {},
          currentSheet: data.currentSheet || null,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
    else setLoading(false);
  }, [user]);

  const calendarWeeks = useMemo(() => {
    const weeks: CalendarDay[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 90);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: CalendarDay[] = [];
    const endDate = new Date(today);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      currentWeek.push({ date: dateStr, count: stats.activity[dateStr] || 0 });
      if (d.getDay() === 6 || d.getTime() === endDate.getTime()) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    return weeks;
  }, [stats.activity]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const totalSubmissions = useMemo(() => Object.values(stats.activity).reduce((a, b) => a + b, 0), [stats.activity]);

  return { stats, loading, calendarWeeks, todayStr, totalSubmissions };
}
