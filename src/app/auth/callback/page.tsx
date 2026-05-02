'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Completing sign in...');

    useEffect(() => {
        const code = searchParams.get('code');
        const returnUrl = searchParams.get('returnUrl');
        
        if (code) {
            // Redirect to the API route to handle the code exchange and DB linking
            const apiCallbackUrl = new URL('/api/auth/callback', window.location.origin);
            apiCallbackUrl.searchParams.set('code', code);
            if (returnUrl) {
                apiCallbackUrl.searchParams.set('returnUrl', returnUrl);
            }
            window.location.href = apiCallbackUrl.toString();
        } else {
            setStatus('No authentication code found. Redirecting...');
            setTimeout(() => router.push('/'), 2000);
        }
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
