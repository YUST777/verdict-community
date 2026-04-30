'use client';

import { useEffect } from 'react';

export default function CommunityRedirect() {
    useEffect(() => {
        window.location.href = 'https://t.me/verdict_run_chat';
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Redirecting to Community...</h1>
                <p className="text-white/50">Taking you to our Telegram group.</p>
            </div>
        </div>
    );
}
