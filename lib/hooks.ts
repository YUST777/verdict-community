'use client';

import { useState, useEffect, useCallback } from 'react';
import { addCacheBust } from '@/lib/cache-version';

export interface Achievement {
    id: number;
    achievement_id: string;
    earned_at: string;
    seen: boolean;
}

export function useAchievements() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [unseenAchievement, setUnseenAchievement] = useState<Achievement | null>(null);

    const fetchAchievements = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setTimeout(() => setLoading(false), 0);
            return;
        }

        try {
            const res = await fetch(addCacheBust('/api/achievements'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const fetchedAchievements = data.achievements || [];
                setAchievements(fetchedAchievements);

                // Find first unseen achievement
                const unseen = fetchedAchievements.find((a: Achievement) => !a.seen);
                setUnseenAchievement(unseen || null);
            }
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        }
        setLoading(false);
    }, []);

    const markAsSeen = useCallback(async (achievementId: number) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const res = await fetch(addCacheBust(`/api/achievements/${achievementId}/seen`), {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setAchievements(prev => {
                    const updated = prev.map(a =>
                        a.id === achievementId ? { ...a, seen: true } : a
                    );
                    const nextUnseen = updated.find(a => !a.seen);
                    setUnseenAchievement(nextUnseen || null);
                    return updated;
                });
            }
        } catch (error) {
            console.error('Failed to mark achievement as seen:', error);
        }
    }, []);

    useEffect(() => {
        // Defer fetch to avoid synchronous setState during render
        const timer = setTimeout(() => fetchAchievements(), 0);
        return () => clearTimeout(timer);
    }, [fetchAchievements]);

    return {
        achievements,
        loading,
        unseenAchievement,
        markAsSeen,
        refetch: fetchAchievements
    };
}
