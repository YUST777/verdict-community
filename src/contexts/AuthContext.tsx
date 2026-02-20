'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

    const refreshSession = React.useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                    setUser({
                        id: data.user.id.toString(),
                        email: data.user.email,
                        isVerified: true,
                        role: 'user',
                        lastLogin: new Date().toISOString(),
                        createdAt: data.user.createdAt || new Date().toISOString(),
                        profile_picture: data.user.profilePicture
                    });
                    setProfile({ id: 0, name: data.user.email.split('@')[0] });
                } else {
                    setUser(null);
                    setProfile(null);
                }
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
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const login = (token: string, redirectUrl = '/problemsets') => {
        void token; // Cookie is set server-side
        refreshSession().then(() => {
            router.push(redirectUrl);
        });
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error', e);
        }
        setUser(null);
        setProfile(null);
        router.push('/login');
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
