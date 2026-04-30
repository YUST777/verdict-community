import { useState, useEffect, useCallback } from 'react';

interface UseCodeforcesHandleReturn {
    handle: string | null;
    loading: boolean;
    error: string | null;
    setHandle: (handle: string) => void;
    refreshHandle: () => Promise<void>;
}

const STORAGE_KEY = 'verdict-cf-handle';

/**
 * Hook to get Codeforces handle from multiple sources:
 * 1. Extension (if available)
 * 2. API (user's saved handle in DB)
 * 3. localStorage (fallback for logged-out users)
 */
export function useCodeforcesHandle(): UseCodeforcesHandleReturn {
    const [handle, setHandleState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const saveToLocalStorage = useCallback((cfHandle: string) => {
        try {
            localStorage.setItem(STORAGE_KEY, cfHandle);
        } catch {}
    }, []);

    const loadFromLocalStorage = useCallback((): string | null => {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }, []);

    const getHandleFromExtension = useCallback(async (): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!document.getElementById('verdict-extension-installed')) {
                resolve(null);
                return;
            }

            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    window.removeEventListener('message', messageHandler);
                    resolve(null);
                }
            }, 2000);

            const messageHandler = (event: MessageEvent) => {
                if (event.source !== window) return;
                if (event.data?.type === 'VERDICT_HANDLE_RESPONSE') {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        window.removeEventListener('message', messageHandler);
                        resolve(event.data.handle || null);
                    }
                }
            };

            window.addEventListener('message', messageHandler);
            window.postMessage({ type: 'VERDICT_GET_HANDLE' }, '*');
        });
    }, []);

    const getHandleFromAPI = useCallback(async (): Promise<string | null> => {
        try {
            const res = await fetch('/api/user/cf-handle');
            if (!res.ok) return null;
            const data = await res.json();
            return data.handle || null;
        } catch {
            return null;
        }
    }, []);

    const saveHandleToDB = useCallback(async (cfHandle: string) => {
        try {
            await fetch('/api/user/cf-handle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle: cfHandle }),
            });
        } catch {}
    }, []);

    const refreshHandle = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Try extension first
            let cfHandle = await getHandleFromExtension();

            // Try DB
            if (!cfHandle) {
                cfHandle = await getHandleFromAPI();
            }

            // Try localStorage fallback
            if (!cfHandle) {
                cfHandle = loadFromLocalStorage();
                // If found in localStorage but not DB, save to DB
                if (cfHandle) {
                    saveHandleToDB(cfHandle);
                }
            }

            if (cfHandle) {
                setHandleState(cfHandle);
                saveToLocalStorage(cfHandle);
            } else {
                setHandleState(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get handle');
            const localHandle = loadFromLocalStorage();
            if (localHandle) setHandleState(localHandle);
        } finally {
            setLoading(false);
        }
    }, [getHandleFromExtension, getHandleFromAPI, loadFromLocalStorage, saveToLocalStorage, saveHandleToDB]);

    // Set handle manually (from user input) — saves to both DB and localStorage
    const setHandle = useCallback((cfHandle: string) => {
        const trimmed = cfHandle.trim();
        if (trimmed) {
            setHandleState(trimmed);
            saveToLocalStorage(trimmed);
            saveHandleToDB(trimmed);
        }
    }, [saveToLocalStorage, saveHandleToDB]);

    useEffect(() => {
        refreshHandle();
    }, [refreshHandle]);

    return { handle, loading, error, setHandle, refreshHandle };
}
