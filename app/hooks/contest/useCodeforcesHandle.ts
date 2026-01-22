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
 * 3. localStorage (user's manually entered handle)
 */
export function useCodeforcesHandle(): UseCodeforcesHandleReturn {
    const [handle, setHandleState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Save handle to localStorage
    const saveToLocalStorage = useCallback((cfHandle: string) => {
        try {
            localStorage.setItem(STORAGE_KEY, cfHandle);
        } catch (e) {
            console.warn('Failed to save handle to localStorage', e);
        }
    }, []);

    // Load handle from localStorage
    const loadFromLocalStorage = useCallback((): string | null => {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }, []);

    // Get handle from extension
    const getHandleFromExtension = useCallback(async (): Promise<string | null> => {
        return new Promise((resolve) => {
            // Check if extension is available
            if (!document.getElementById('verdict-extension-installed')) {
                resolve(null);
                return;
            }

            let resolved = false;

            // Set timeout in case extension doesn't respond
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    window.removeEventListener('message', messageHandler);
                    resolve(null);
                }
            }, 2000);

            // Listen for extension response
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

            // Request handle from extension
            window.postMessage({
                type: 'VERDICT_GET_HANDLE'
            }, '*');
        });
    }, []);

    // Get handle from API
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

    // Refresh handle from all sources
    const refreshHandle = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Try extension first
            let cfHandle = await getHandleFromExtension();
            
            // Try API if extension didn't provide handle
            if (!cfHandle) {
                cfHandle = await getHandleFromAPI();
            }

            // Try localStorage if API didn't provide handle
            if (!cfHandle) {
                cfHandle = loadFromLocalStorage();
            }

            if (cfHandle) {
                setHandleState(cfHandle);
                // Save to localStorage for future use
                saveToLocalStorage(cfHandle);
            } else {
                setHandleState(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get handle');
            // Fallback to localStorage
            const localHandle = loadFromLocalStorage();
            if (localHandle) {
                setHandleState(localHandle);
            }
        } finally {
            setLoading(false);
        }
    }, [getHandleFromExtension, getHandleFromAPI, loadFromLocalStorage, saveToLocalStorage]);

    // Set handle manually (from user input)
    const setHandle = useCallback((cfHandle: string) => {
        const trimmed = cfHandle.trim();
        if (trimmed) {
            setHandleState(trimmed);
            saveToLocalStorage(trimmed);
        }
    }, [saveToLocalStorage]);

    // Load handle on mount
    useEffect(() => {
        refreshHandle();
    }, [refreshHandle]);

    return {
        handle,
        loading,
        error,
        setHandle,
        refreshHandle
    };
}

