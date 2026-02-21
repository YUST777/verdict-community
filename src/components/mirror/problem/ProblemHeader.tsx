'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, HardDrive, FileText, Code } from 'lucide-react';
import { CFProblemData } from '../shared/types';

interface ProblemHeaderProps {
    sheetId: string;
    problem: CFProblemData | null;
    mobileView: 'problem' | 'code';
    setMobileView: (view: 'problem' | 'code') => void;
    navigationBaseUrl: string;
    problemId: string;
}

export default function ProblemHeader({
    sheetId,
    problem,
    mobileView,
    setMobileView,
    navigationBaseUrl,
    problemId
}: ProblemHeaderProps) {
    // Navigation Heuristics
    const currentId = problemId || '';

    const getNextId = (id: string) => {
        if (!id) return null;
        // Check if ends with digit (e.g. C1 -> C2)
        const digitMatch = id.match(/(\d+)$/);
        if (digitMatch) {
            const num = parseInt(digitMatch[1]);
            const prefix = id.slice(0, -digitMatch[0].length);
            return `${prefix}${num + 1}`;
        }
        // Check if ends with letter
        const charCode = id.charCodeAt(id.length - 1);
        if (charCode >= 65 && charCode < 90) { // A-Y
            return id.slice(0, -1) + String.fromCharCode(charCode + 1);
        }
        return null;
    };

    const getPrevId = (id: string) => {
        if (!id) return null;
        const digitMatch = id.match(/(\d+)$/);
        if (digitMatch) {
            const num = parseInt(digitMatch[1]);
            if (num > 1) {
                const prefix = id.slice(0, -digitMatch[0].length);
                return `${prefix}${num - 1}`;
            }
            return null;
        }
        const charCode = id.charCodeAt(id.length - 1);
        if (charCode > 65 && charCode <= 90) { // B-Z
            return id.slice(0, -1) + String.fromCharCode(charCode - 1);
        }
        return null;
    };

    const prevId = getPrevId(currentId);
    const nextId = getNextId(currentId);

    const title = problem?.meta?.title || 'Loading...';
    // Remove duplication if title starts with ID
    const showIdPrefix = problemId && !title.startsWith(problemId + '.');

    return (
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[#121212] px-4 py-3 shrink-0">
            {/* Top Row: Navigation & Title */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Link
                        href="/"
                        className="p-1.5 -ml-1.5 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Back to Problems"
                    >
                        <ArrowLeft size={18} strokeWidth={2} />
                    </Link>

                    <div className="h-4 w-[1px] bg-white/10 shrink-0" />

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-semibold text-white/90 truncate flex items-center gap-2">
                                {showIdPrefix && (
                                    <span className="text-xs font-mono text-[#10B981]/80 bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                                        {problemId}
                                    </span>
                                )}
                                <span className="truncate">{title}</span>
                            </h1>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center shrink-0 gap-0.5 ml-2">
                        <Link
                            href={prevId ? `${navigationBaseUrl}/${prevId}` : '#'}
                            className={`p-1.5 rounded-md active:bg-white/20 transition-all flex items-center justify-center touch-manipulation min-w-[28px] min-h-[28px] ${prevId ? 'text-white/70 active:text-white hover:bg-white/5' : 'text-white/20 cursor-not-allowed pointer-events-none'}`}
                            aria-disabled={!prevId}
                        >
                            <ChevronLeft size={16} />
                        </Link>
                        <Link
                            href={nextId ? `${navigationBaseUrl}/${nextId}` : '#'}
                            className={`p-1.5 rounded-md active:bg-white/20 transition-all flex items-center justify-center touch-manipulation min-w-[28px] min-h-[28px] ${nextId ? 'text-white/70 active:text-white hover:bg-white/5' : 'text-white/20 cursor-not-allowed pointer-events-none'}`}
                            aria-disabled={!nextId}
                        >
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Mobile View Toggle */}
                <div className="flex md:hidden bg-[#1a1a1a] p-0.5 rounded-lg border border-white/10 shrink-0">
                    <button
                        onClick={() => setMobileView('problem')}
                        className={`p-1.5 rounded-md transition-all ${mobileView === 'problem'
                            ? 'bg-[#2a2a2a] text-white shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <FileText size={14} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => setMobileView('code')}
                        className={`p-1.5 rounded-md transition-all ${mobileView === 'code'
                            ? 'bg-[#2a2a2a] text-white shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <Code size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Desktop Version Info & Logo */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="relative flex items-center group">
                        <div className="opacity-80 hover:opacity-100 transition-opacity cursor-default">
                            <Image
                                src="/icons/logo.webp"
                                alt="Verdict"
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
