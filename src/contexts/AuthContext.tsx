'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CACHE_VERSION } from '@/lib/cache-version';
import { fetchWithCache, clearApiCache } from '@/lib/cache/api-cache';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: number;
  email: string;
  isVerified?: boolean;
  telegram_username?: string;
  role?: string;
  profile_picture?: string | null;
  created_at?: string;
  name?: string;
  username?: string;
  faculty?: string;
  studentLevel?: string;
  university?: {
    id: number;
    name: string;
    shortName: string;
    slug: string;
    type: string;
  } | null;
}

interface Profile {
  id: number;
  name: string;
  faculty?: string;
  student_id?: string;
  student_level?: string;
  telephone?: string;
  codeforces_profile?: string;
  leetcode_profile?: string;
  telegram_username?: string;
  codeforces_data?: {
    rating?: number;
    maxRating?: number;
    rank?: string;
    handle?: string;
  };
  leetcode_data?: {
    totalSolved?: number;
    ranking?: number;
  };
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, redirectUrl?: string) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const supabase = createClient();

  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await fetchWithCache<any>(`/api/auth/me?_v=${CACHE_VERSION}`, { credentials: 'include' }, 120);
      const userData = data?.user || null;
      const profileData = data?.profile || null;
      setUser(userData);
      setProfile(profileData);
      setIsAuthenticated(!!userData);
    } catch {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await fetchUserProfile();
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut().catch(() => {});
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    clearApiCache();
  }, [supabase]);

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshSession();
    });

    return () => subscription.unsubscribe();
  }, [refreshSession, supabase]);

  const login = (token: string, redirectUrl = '/problemsets') => {
    void token;
    refreshSession().then(() => {
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    });
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    refreshProfile: fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
