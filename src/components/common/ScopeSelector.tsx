'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, Building2, ChevronDown } from 'lucide-react';
import type { Scope } from '@/hooks/useScope';

interface ScopeSelectorProps {
    scope: Scope;
    setScope: (s: Scope) => void;
    universityName?: string;
    onUniChange?: (id: number, name: string) => void;
    selectedUniId?: number;
}

export function ScopeSelector({ scope, setScope, universityName, onUniChange, selectedUniId }: ScopeSelectorProps) {
    const [universities, setUniversities] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && universities.length === 0) {
            fetch('/api/universities').then(r => r.json()).then(data => {
                if (Array.isArray(data)) setUniversities(data);
            }).catch(console.error);
        }
    }, [isOpen, universities.length]);

    useEffect(() => {
        if (!isOpen) setSearchTerm('');
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredUniversities = universities.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.shortName && u.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeUniName = universities.find(u => u.id === selectedUniId)?.shortName 
        || universityName 
        || 'University';

    return (
        <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg border border-white/5 relative" ref={dropdownRef}>
            <button
                onClick={() => { setScope('national'); setIsOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    scope === 'national'
                        ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                        : 'text-[#808080] hover:text-white'
                }`}
            >
                <Globe size={13} />
                Egypt
            </button>
            
            <div className="relative">
                <button
                    onClick={() => {
                        if (scope !== 'university') {
                            setScope('university');
                        } else {
                            setIsOpen(!isOpen);
                        }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        scope === 'university'
                            ? 'bg-purple-500/20 text-purple-400 shadow-sm'
                            : 'text-[#808080] hover:text-white'
                    }`}
                >
                    <Building2 size={13} />
                    {activeUniName}
                    {scope === 'university' && <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 flex flex-col">
                        <div className="p-2 border-b border-white/5 sticky top-0 bg-[#1a1a1a] z-10">
                            <input
                                type="text"
                                placeholder="Search university..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 py-1">
                            {universities.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-[#808080] text-center">Loading...</div>
                            ) : filteredUniversities.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-[#808080] text-center">No results found</div>
                            ) : (
                                filteredUniversities.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => {
                                            if (onUniChange) onUniChange(u.id, u.shortName || u.name);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                            selectedUniId === u.id 
                                                ? 'bg-purple-500/20 text-purple-400' 
                                                : 'text-[#F2F2F2] hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="font-medium">{u.name}</div>
                                        <div className="text-[10px] text-[#808080]">{u.shortName}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
