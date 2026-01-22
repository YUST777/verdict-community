import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, HardDrive, FileText, Code } from 'lucide-react';
import { Problem } from './types';

interface ProblemHeaderProps {
    sheetId: string;
    problem: Problem | null;
    mobileView: 'problem' | 'code';
    setMobileView: (view: 'problem' | 'code') => void;
    navigationBaseUrl: string;
}

export default function ProblemHeader({ problem, mobileView, setMobileView, navigationBaseUrl }: ProblemHeaderProps) {
    const title = problem?.title || 'Loading...';
    // Remove duplication if title starts with ID
    const showIdPrefix = problem?.id && !title.startsWith(problem.id + '.');

    // Navigation Heuristics
    const currentId = problem?.id || '';

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

    return (
        <div className="sticky top-0 z-10 w-full shrink-0 flex flex-col bg-[#121212] border-b border-white/10 transition-all duration-200">
            {/* Top Bar: Navigation & Title */}
            <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 w-full min-h-[48px]">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <Link href="/" className="group flex items-center gap-1.5 sm:gap-2 text-white/60 hover:text-white transition-colors shrink-0 touch-manipulation">
                        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-medium hidden sm:block">Back</span>
                    </Link>

                    <div className="h-4 w-px bg-white/10 hidden sm:block shrink-0" />

                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                        <h1 className="font-bold text-white truncate text-xs sm:text-sm md:text-base min-w-0">
                            {showIdPrefix && <span className="text-[#10B981]">{problem?.id}.</span>}
                            <span className="truncate">{title}</span>
                        </h1>

                        {/* Navigation Arrows - Right after title */}
                        <div className="flex items-center shrink-0 gap-0.5">
                            <Link
                                href={prevId ? `${navigationBaseUrl}/${prevId}` : '#'}
                                className={`p-1.5 rounded-md active:bg-white/20 transition-all flex items-center justify-center touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 ${prevId ? 'text-white/70 active:text-white' : 'text-white/20 cursor-not-allowed pointer-events-none'}`}
                                aria-disabled={!prevId}
                            >
                                <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </Link>
                            <Link
                                href={nextId ? `${navigationBaseUrl}/${nextId}` : '#'}
                                className={`p-1.5 rounded-md active:bg-white/20 transition-all flex items-center justify-center touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 ${nextId ? 'text-white/70 active:text-white' : 'text-white/20 cursor-not-allowed pointer-events-none'}`}
                                aria-disabled={!nextId}
                            >
                                <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </Link>
                        </div>
                    </div>
                </div>

                    {/* Right Side: Limits & Logo (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-6 shrink-0">
                        {problem && (
                            <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {(problem.timeLimit / 1000).toString().replace(/\.0+$/, '')}s
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <HardDrive size={14} />
                                    {problem.memoryLimit}MB
                                </span>
                            </div>
                        )}

                        <div className="relative flex items-center group">
                            <div className="opacity-80 hover:opacity-100 transition-opacity cursor-default">
                                <Image
                                    src="/icons/logo.webp"
                                    alt="Verdict"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            </div>
                            {/* Version Popout */}
                            <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                                    <span className="text-xs text-white/80 font-medium whitespace-nowrap">
                                        v1.0.1
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

            {/* Mobile View Toggle Tabs (Row 2) */}
            <div className="flex md:hidden w-full border-t border-white/10">
                <button
                    onClick={() => setMobileView('problem')}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative touch-manipulation active:bg-white/10
                        ${mobileView === 'problem' ? 'text-white bg-white/5' : 'text-white/60 active:text-white active:bg-white/5'}`}
                >
                    <FileText size={14} className="sm:w-4 sm:h-4" />
                    <span>Problem</span>
                    {mobileView === 'problem' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                    )}
                </button>
                <button
                    onClick={() => setMobileView('code')}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative touch-manipulation active:bg-white/10
                        ${mobileView === 'code' ? 'text-white bg-white/5' : 'text-white/60 active:text-white active:bg-white/5'}`}
                >
                    <Code size={14} className="sm:w-4 sm:h-4" />
                    <span>Code</span>
                    {mobileView === 'code' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                    )}
                </button>
            </div>
        </div>
    );
}
