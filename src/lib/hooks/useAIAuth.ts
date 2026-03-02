'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthUser {
    id: string;
    email: string;
    profilePicture?: string | null;
}

interface UseAIAuthReturn {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AuthUser | null;
    csrfToken: string | null;
    checkAuth: () => Promise<boolean>;
    getHeaders: () => Record<string, string>;
    handleAuthError: (response: Response) => Promise<{ needsAuth: boolean; newCsrfToken?: string }>;
}

export function useAIAuth(): UseAIAuthReturn {
    const { user: authUser, loading: authLoading, isAuthenticated: authIsAuthenticated, refreshSession } = useAuth();
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    // Map AuthContext user to AuthUser
    const user: AuthUser | null = authUser ? {
        id: authUser.id,
        email: authUser.email,
        profilePicture: authUser.profile_picture
    } : null;

    // Fetch CSRF token only if authenticated
    const fetchCSRFToken = useCallback(async () => {
        if (!authIsAuthenticated) return null;
        try {
            const response = await fetch('/api/auth/csrf', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCsrfToken(data.csrfToken);
                return data.csrfToken;
            }
        } catch (error) {
            console.error('[CSRF Token Error]', error);
        }
        return null; // Return null if failed
    }, [authIsAuthenticated]);

    // Fetch CSRF token on auth change
    useEffect(() => {
        if (authIsAuthenticated && !csrfToken) {
            fetchCSRFToken();
        }
    }, [authIsAuthenticated, csrfToken, fetchCSRFToken]);

    // Check auth (wraps refreshSession)
    const checkAuth = useCallback(async (): Promise<boolean> => {
        await refreshSession();
        return !!authIsAuthenticated;
    }, [refreshSession, authIsAuthenticated]);

    // Get headers for AI requests
    const getHeaders = useCallback((): Record<string, string> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (csrfToken) {
            headers['x-csrf-token'] = csrfToken;
        }

        return headers;
    }, [csrfToken]);

    // Handle auth errors from API responses
    const handleAuthError = useCallback(async (response: Response): Promise<{ needsAuth: boolean; newCsrfToken?: string }> => {
        if (response.status === 401) {
            await refreshSession(); // Verify if session is truly gone
            return { needsAuth: true };
        }

        if (response.status === 403) {
            // CSRF token might be invalid, try to get a new one
            const data = await response.json().catch(() => ({}));
            if (data.code === 'CSRF_INVALID' && data.csrfToken) {
                setCsrfToken(data.csrfToken);
                return { needsAuth: false, newCsrfToken: data.csrfToken };
            }
        }

        return { needsAuth: false };
    }, [refreshSession]);

    return {
        isAuthenticated: authIsAuthenticated,
        isLoading: authLoading,
        user,
        csrfToken,
        checkAuth,
        getHeaders,
        handleAuthError
    };
}
