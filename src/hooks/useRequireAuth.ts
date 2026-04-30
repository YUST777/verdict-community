import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook that provides an auth gate for features requiring login.
 * Returns a `requireAuth` function that checks if the user is logged in.
 * If not, it opens the sign-in modal and returns false.
 * If yes, it returns true so the caller can proceed.
 */
export function useRequireAuth() {
    const { isAuthenticated, loading } = useAuth();
    const [showSignIn, setShowSignIn] = useState(false);

    const requireAuth = useCallback(() => {
        if (loading) return false;
        if (!isAuthenticated) {
            setShowSignIn(true);
            return false;
        }
        return true;
    }, [isAuthenticated, loading]);

    return {
        requireAuth,
        isAuthenticated,
        showSignIn,
        setShowSignIn,
    };
}
