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
    profile: Profile | null; // Application profile
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, redirectUrl?: string) => void;
    logout: () => void;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AuthProvider({ children, initialToken: _initialToken }: { children: React.ReactNode; initialToken?: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const refreshSession = React.useCallback(async () => {
        // Session check disabled - using Supabase client auth
        setLoading(false);
        setUser(null);
        setProfile(null);
    }, []);

    useEffect(() => {
        // If initialToken is provided (SSR), strictly we might verify it, but usually we just fetch /me
        // to get the user details.
        // We can optimistically assume logged in if we wanted, but explicit fetch is safer.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshSession();
    }, [refreshSession]);

    const login = (token: string, redirectUrl = '/dashboard') => {
        // In a cookie-based system, the token is usually set by the server (httpOnly) or via document.cookie.
        // If passed here, we might set it manually if it's not httpOnly, but our system seems to use cookies.
        // We'll assume the caller handled cookie setting or the API did.
        // We just refresh session and redirect.
        refreshSession().then(() => {
            router.push(redirectUrl);
        });
    };

    const logout = async () => {
        try {
            // Call logout API
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
