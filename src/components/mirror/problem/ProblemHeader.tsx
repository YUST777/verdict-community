"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ChevronLeft, ChevronRight, FileText, Code,
    ListVideo, Shuffle, Play, CloudUpload, StickyNote,
    Search,
} from "lucide-react";
import { CFProblemData } from "../shared/types";
import type { SheetProblem } from "./ProblemDrawer";
import { Tooltip } from "@/components/ui/Tooltip";
import { HeaderActions } from "../header/HeaderActions";
import { useMemo, useCallback } from "react";

interface ProblemHeaderProps {
    sheetId: string;
    problem: CFProblemData | null;
    mobileView: "problem" | "code";
    setMobileView: (view: "problem" | "code") => void;
    navigationBaseUrl: string;
    problemId: string;
    onToggleSidebar: () => void;
    onOpenDrawer?: () => void;
    sheetProblems?: SheetProblem[];
    onSubmit: () => void;
    onRunTests: () => void;
    submitting: boolean;
    showNotes: boolean;
    setShowNotes: (show: boolean) => void;
}

export default function ProblemHeader({
    problem,
    mobileView,
    setMobileView,
    navigationBaseUrl,
    problemId,
    onOpenDrawer,
    sheetProblems,
    onSubmit,
    onRunTests,
    submitting,
    showNotes,
    setShowNotes,
}: ProblemHeaderProps) {
    const currentId = problemId || "";

    const currentIndex = useMemo(() =>
        sheetProblems?.findIndex(
            (p) => p.index.toUpperCase() === currentId.toUpperCase()
        ) ?? -1,
        [sheetProblems, currentId]
    );

    const prevProblem = currentIndex > 0 ? sheetProblems![currentIndex - 1] : null;
    const nextProblem =
        currentIndex >= 0 && sheetProblems && currentIndex < sheetProblems.length - 1
            ? sheetProblems[currentIndex + 1]
            : null;

    const getNextIdFallback = (id: string) => {
        if (!id) return null;
        const d = id.match(/(\d+)$/);
        if (d) return id.slice(0, -d[0].length) + (parseInt(d[1]) + 1);
        const c = id.charCodeAt(id.length - 1);
        if (c >= 65 && c < 90) return id.slice(0, -1) + String.fromCharCode(c + 1);
        return null;
    };

    const getPrevIdFallback = (id: string) => {
        if (!id) return null;
        const d = id.match(/(\d+)$/);
        if (d) { const n = parseInt(d[1]); return n > 1 ? id.slice(0, -d[0].length) + (n - 1) : null; }
        const c = id.charCodeAt(id.length - 1);
        if (c > 65 && c <= 90) return id.slice(0, -1) + String.fromCharCode(c - 1);
        return null;
    };

    const prevId = prevProblem ? prevProblem.index : getPrevIdFallback(currentId);
    const nextId = nextProblem ? nextProblem.index : getNextIdFallback(currentId);

    const getRandomId = useCallback(() => {
        if (!sheetProblems || sheetProblems.length <= 1) return null;
        const others = sheetProblems.filter(
            (p) => p.index.toUpperCase() !== currentId.toUpperCase()
        );
        return others.length ? others[Math.floor(Math.random() * others.length)].index : null;
    }, [sheetProblems, currentId]);

    return (
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[#121212] px-4 py-2 shrink-0 relative z-[100]">
            <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 w-full min-h-[48px] relative">
                {/* Left: Logo + Navigation */}
                <div className="flex items-center gap-2">
                    <Link
                        href={navigationBaseUrl}
                        className="relative flex items-center group shrink-0 transition-transform active:scale-90 select-none -ml-1"
                        title="Back"
                    >
                        <div className="opacity-100 transition-opacity flex items-center justify-center w-10">
                            <Image src="/icons/logo.svg" alt="Verdict" width={32} height={32} className="h-8 w-auto object-contain rounded-full" />
                        </div>
                    </Link>

                    <div className="flex items-center rounded-md h-8 overflow-hidden ml-1 sm:ml-2">
                        <Tooltip content="Problem List" position="bottom">
                            {onOpenDrawer ? (
                                <button
                                    onClick={onOpenDrawer}
                                    className="flex items-center gap-2 px-6 h-full text-white/80 hover:bg-[#282828] transition-colors font-medium text-sm whitespace-nowrap"
                                >
                                    <ListVideo size={16} className="opacity-70" />
                                    <span className="hidden sm:inline">Problem List</span>
                                </button>
                            ) : (
                                <Link href={navigationBaseUrl} className="flex items-center gap-2 px-6 h-full text-white/80 hover:bg-[#282828] transition-colors font-medium text-sm whitespace-nowrap">
                                    <ListVideo size={16} className="opacity-70" />
                                    <span className="hidden sm:inline">Problem List</span>
                                </Link>
                            )}
                        </Tooltip>
                        <div className="w-px h-full bg-white/10" />
                        <Tooltip content={prevProblem ? `Prev: ${prevProblem.name}` : "Previous problem"} position="bottom">
                            <Link
                                href={prevId ? `${navigationBaseUrl}/${prevId.trim()}` : "#"}
                                className={`w-12 h-full flex items-center justify-center transition-colors ${prevId ? "text-white/60 hover:text-white hover:bg-[#282828]" : "text-white/20 cursor-not-allowed pointer-events-none"}`}
                                aria-disabled={!prevId}
                            >
                                <ChevronLeft size={16} />
                            </Link>
                        </Tooltip>
                        <div className="w-px h-full bg-white/10" />
                        <Tooltip content={nextProblem ? `Next: ${nextProblem.name}` : "Next problem"} position="bottom">
                            <Link
                                href={nextId ? `${navigationBaseUrl}/${nextId.trim()}` : "#"}
                                className={`w-12 h-full flex items-center justify-center transition-colors ${nextId ? "text-white/60 hover:text-white hover:bg-[#282828]" : "text-white/20 cursor-not-allowed pointer-events-none"}`}
                                aria-disabled={!nextId}
                            >
                                <ChevronRight size={16} />
                            </Link>
                        </Tooltip>
                        {sheetProblems && sheetProblems.length > 1 && (
                            <>
                                <div className="w-px h-full bg-white/10" />
                                <Tooltip content="Random problem" position="bottom">
                                    <Link
                                        href={(() => { const r = getRandomId(); return r ? `${navigationBaseUrl}/${r}` : "#"; })()}
                                        className="w-12 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-[#282828] transition-colors"
                                    >
                                        <Shuffle size={14} />
                                    </Link>
                                </Tooltip>
                            </>
                        )}
                    </div>
                </div>

                {/* Center: Submit & Run Actions */}
                <div className="hidden lg:flex flex-col min-w-0 flex-1 items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5">
                        <Tooltip content="Run Local Tests" shortcut={["Ctrl", "'"]} position="bottom">
                            <button
                                onClick={onRunTests}
                                disabled={submitting}
                                className="p-2 w-10 h-10 flex items-center justify-center bg-[#1e1e1e] hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white/70 hover:text-white rounded-lg transition-all border border-white/5 hover:border-white/10"
                            >
                                <Play size={18} fill="currentColor" className="ml-0.5" />
                            </button>
                        </Tooltip>
                        <Tooltip content="Submit to Codeforces" shortcut={["Ctrl", "Enter"]} position="bottom">
                            <button
                                id="onboarding-submit-btn"
                                onClick={onSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 h-10 bg-[#1e1e1e] hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all border border-white/5 hover:border-white/10 min-w-[120px] justify-center"
                            >
                                <CloudUpload size={18} className="text-[#10B981]" />
                                <span className="text-sm">Submit</span>
                            </button>
                        </Tooltip>
                        <Tooltip content="Problem Notes" position="bottom">
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className={`p-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all border ${
                                    showNotes
                                        ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                                        : 'bg-[#1e1e1e] border-white/5 text-white/40 hover:text-white hover:bg-[#2a2a2a] hover:border-white/10'
                                }`}
                            >
                                <StickyNote size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Right: Header Actions (desktop) + Mobile View Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    <HeaderActions />
                    <div className="flex md:hidden bg-[#1a1a1a] p-0.5 rounded-lg border border-white/10">
                        <button
                            onClick={() => setMobileView("problem")}
                            className={`p-1.5 rounded-md transition-all ${mobileView === "problem" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
                        >
                            <FileText size={14} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => setMobileView("code")}
                            className={`p-1.5 rounded-md transition-all ${mobileView === "code" ? "bg-[#2a2a2a] text-white shadow-sm" : "text-white/40 hover:text-white/60"}`}
                        >
                            <Code size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
