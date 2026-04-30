'use client';

import { Trophy, Construction } from 'lucide-react';
import Link from 'next/link';

export default function AchievementsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 mb-6">
                <Trophy size={48} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
            <p className="text-[#808080] text-sm max-w-md mb-6">
                The achievements system is being redesigned. Check back soon for a brand new badge collection.
            </p>
            <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-600 transition-all text-sm"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}
