'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface User {
    id: string;
    email: string;
    isVerified: boolean;
    lastLogin: string;
    createdAt: string;
    role: string;
    profile_picture?: string | null;
}

interface Profile {
    id: number;
    name: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const supabase = createClient();

    const refreshSession = React.useCallback(async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    isVerified: true,
                    role: 'user',
                    lastLogin: session.user.last_sign_in_at || new Date().toISOString(),
                    createdAt: session.user.created_at || new Date().toISOString(),
                    profile_picture: session.user.user_metadata?.avatar_url
                });
                setProfile({ id: 0, name: session.user.email?.split('@')[0] || 'User' });
            } else if (process.env.NODE_ENV === 'development') {
                // Auth Bypass for Local Development
                setUser({
                    id: 'dev-mock-uuid',
                    email: 'dev@verdict.run',
                    isVerified: true,
                    role: 'admin',
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    profile_picture: null
                });
                setProfile({ id: 1, name: 'DevUser' });
            } else {
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error('Session check failed', error);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
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
            router.push(redirectUrl);
        });
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Logout error', e);
        }
        setUser(null);
        setProfile(null);
        // No redirect to /login here; handled by UI state or sign-in modal
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshSession
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
