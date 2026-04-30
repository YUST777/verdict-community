'use client';

import { Globe, Building2 } from 'lucide-react';
import type { Scope } from '@/hooks/useScope';

interface ScopeSelectorProps {
    scope: Scope;
    setScope: (s: Scope) => void;
    universityName?: string;
}

export function ScopeSelector({ scope, setScope, universityName }: ScopeSelectorProps) {
    return (
        <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg border border-white/5">
            <button
                onClick={() => setScope('national')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    scope === 'national'
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                        : 'text-[#808080] hover:text-white'
                }`}
            >
                <Globe size={13} />
                Egypt
            </button>
            <button
                onClick={() => setScope('university')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    scope === 'university'
                        ? 'bg-purple-500/20 text-purple-400 shadow-sm'
                        : 'text-[#808080] hover:text-white'
                }`}
            >
                <Building2 size={13} />
                {universityName || 'My Uni'}
            </button>
        </div>
    );
}
