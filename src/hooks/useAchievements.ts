'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { addCacheBust } from '@/lib/cache-version';
import { fetchWithCache } from '@/lib/cache/api-cache';

export interface Achievement {
  id: number;
  achievement_id: string;
  earned_at: string;
  seen: boolean;
}

export function useAchievements(isAuthenticated: boolean = false) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [unseenAchievement, setUnseenAchievement] = useState<Achievement | null>(null);
  const markSeenInFlight = useRef<Set<number>>(new Set());

  const fetchAchievements = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchWithCache<any>(addCacheBust('/api/achievements'), { credentials: 'include' }, 300);
      const fetchedAchievements = data.achievements || [];
      setAchievements(fetchedAchievements);
      const unseen = fetchedAchievements.find((a: Achievement) => !a.seen);
      setUnseenAchievement(unseen || null);
    } catch {
      setUnseenAchievement(null);
    }
    setLoading(false);
  }, [isAuthenticated]);

  const markAsSeen = useCallback(async (achievementId: number) => {
    if (markSeenInFlight.current.has(achievementId)) return;
    markSeenInFlight.current.add(achievementId);

    setAchievements(prev => {
      const updated = prev.map(a => (a.id === achievementId ? { ...a, seen: true } : a));
      const nextUnseen = updated.find(a => !a.seen);
      setUnseenAchievement(nextUnseen || null);
      return updated;
    });

    try {
      await fetch(addCacheBust('/api/achievements'), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId }),
      });
    } finally {
      markSeenInFlight.current.delete(achievementId);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchAchievements();
    }, 0);
  }, [fetchAchievements]);

  return { achievements, loading, unseenAchievement, markAsSeen, refetch: fetchAchievements };
}
