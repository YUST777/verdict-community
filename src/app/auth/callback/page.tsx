'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Signing you in...');

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createClient();
            const returnUrl = searchParams.get('returnUrl');

            try {
                // With implicit flow, the session is set automatically from the URL hash
                // Wait a moment for the client to process the hash tokens
                setStatus('Processing authentication...');

                // Give the supabase client time to detect and process the session from URL
                await new Promise(resolve => setTimeout(resolve, 500));

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('getSession error:', error.message);
                    throw error;
                }

                if (!session) {
                    // Try once more after a longer delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const retry = await supabase.auth.getSession();
                    if (retry.error || !retry.data.session) {
                        throw new Error('No session found after authentication');
                    }
                    // Use retry session
                    if (retry.data.session.user?.email) {
                        setStatus('Syncing account...');
                        await fetch('/api/auth/callback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: retry.data.session.user.email }),
                        });
                    }
                } else {
                    if (session.user?.email) {
                        setStatus('Syncing account...');
                        await fetch('/api/auth/callback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: session.user.email }),
                        });
                    }
                }

                // Redirect to return URL or default
                let redirectPath = '/problemsets';
                if (returnUrl) {
                    try {
                        const returnUrlObj = new URL(returnUrl);
                        if (returnUrlObj.hostname === window.location.hostname) {
                            redirectPath = returnUrlObj.pathname + returnUrlObj.search;
                        }
                    } catch { /* invalid URL */ }
                }

                setStatus('Success! Redirecting...');
                router.push(redirectPath);
            } catch (err: any) {
                console.error('Auth callback error:', err?.message || err);
                setStatus(`Authentication failed: ${err?.message || 'Unknown error'}`);
                setTimeout(() => router.push('/?error=auth_failed'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <p className="text-white/70 text-sm">{status}</p>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <Suspense fallback={<p className="text-white/70 text-sm">Loading...</p>}>
                    <AuthCallbackContent />
                </Suspense>
            </div>
        </div>
    );
}
