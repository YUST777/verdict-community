'use client';

import { useEffect } from 'react';

export default function HelpRedirect() {
    useEffect(() => {
        window.location.href = 'mailto:support@verdict.run';
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Opening Support...</h1>
                <p className="text-white/50">One moment while we open your email client.</p>
            </div>
        </div>
    );
}
