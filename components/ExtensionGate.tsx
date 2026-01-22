'use client';

import { useEffect, useState, useCallback } from 'react';
// Icons kept for potential future UI states

interface ExtensionGateProps {
    children: React.ReactNode;
}

export default function ExtensionGate({ children }: ExtensionGateProps) {
    const [status, setStatus] = useState<'checking' | 'not-installed' | 'installed' | 'not-logged-in' | 'ready'>('checking');
    const [handle, setHandle] = useState<string | null>(null);
    const [checkCount, setCheckCount] = useState(0);

    // Check for extension
    const checkExtension = () => {
        // Look for the marker element injected by content script
        const marker = document.getElementById('verdict-extension-installed');
        if (marker) {
            return true;
        }
        return false;
    };

    // Check login status via extension
    const checkLogin = (): Promise<{ loggedIn: boolean; handle?: string }> => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ loggedIn: false });
            }, 3000);

            const handler = (event: MessageEvent) => {
                if (event.data?.type === 'VERDICT_LOGIN_STATUS') {
                    clearTimeout(timeout);
                    window.removeEventListener('message', handler);
                    resolve({
                        loggedIn: event.data.loggedIn,
                        handle: event.data.handle
                    });
                }
            };

            window.addEventListener('message', handler);
            window.postMessage({ type: 'VERDICT_CHECK_LOGIN' }, '*');
        });
    };

    // Main status check
    const performCheck = useCallback(async () => {
        setStatus('checking');

        // Wait a bit for content script to inject
        await new Promise(r => setTimeout(r, 300));

        const extensionInstalled = checkExtension();

        if (!extensionInstalled) {
            setStatus('not-installed');
            return;
        }

        // Extension is installed, check login
        const loginStatus = await checkLogin();

        if (!loginStatus.loggedIn) {
            setStatus('not-logged-in');
            return;
        }

        setHandle(loginStatus.handle || null);
        setStatus('ready');
    }, []);

    // Initial check and re-check on focus (user might install extension and come back)
    useEffect(() => {
        // Initial check on mount
        const doCheck = async () => {
            await performCheck();
        };
        doCheck();

        // Re-check when window gains focus
        const handleFocus = () => {
            if (status !== 'ready') {
                setCheckCount(c => c + 1);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [checkCount, performCheck, status]);

    // Listen for extension ready event
    useEffect(() => {
        const handler = () => {
            performCheck();
        };
        window.addEventListener('verdict-extension-ready', handler);
        return () => window.removeEventListener('verdict-extension-ready', handler);
    }, [performCheck]);

    // Render children immediately (non-blocking)
    // The ExtensionOnboardingModal in the page will handle the recommendation
    return (
        <>
            {/* Optional: Show logged-in handle badge if detected */}
            {handle && (
                <div className="fixed bottom-4 right-4 z-40 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-sm shadow-lg pointer-events-none">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[#888]">Logged in as</span>
                    <span className="text-[#10B981] font-medium">{handle}</span>
                </div>
            )}
            {children}
        </>
    );
}

