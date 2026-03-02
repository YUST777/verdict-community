"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ChevronLeft, ChevronRight, FileText, Code,
    List, Shuffle, PanelLeft,
} from "lucide-react";
import { SidebarToggleIcon } from "@/components/ui/icons/SidebarToggleIcon";
import { CFProblemData } from "../shared/types";
import type { SheetProblem } from "./ProblemDrawer";

interface ProblemHeaderProps {
    sheetId: string;
    problem: CFProblemData | null;
    mobileView: "problem" | "code";
    setMobileView: (view: "problem" | "code") => void;
    navigationBaseUrl: string;
    problemId: string;
    onToggleSidebar: () => void;
    /** Open the problem drawer */
    onOpenDrawer?: () => void;
    /** Sheet-aware problem list for prev/next/random */
    sheetProblems?: SheetProblem[];
}

export default function ProblemHeader({
    sheetId,
    problem,
    mobileView,
    setMobileView,
    navigationBaseUrl,
    problemId,
    onToggleSidebar,
    onOpenDrawer,
    sheetProblems,
}: ProblemHeaderProps) {
    const currentId = problemId || "";

    // ─── Sheet-aware navigation ───
    const currentIndex = sheetProblems?.findIndex(
        (p) => p.index.toUpperCase() === currentId.toUpperCase()
    ) ?? -1;

    const prevProblem = currentIndex > 0 ? sheetProblems![currentIndex - 1] : null;
    const nextProblem =
        currentIndex >= 0 && sheetProblems && currentIndex < sheetProblems.length - 1
            ? sheetProblems[currentIndex + 1]
            : null;

    // Fallback heuristic navigation when no sheet is loaded
    const getNextIdFallback = (id: string) => {
        if (!id) return null;
        const digitMatch = id.match(/(\d+)$/);
        if (digitMatch) {
            const num = parseInt(digitMatch[1]);
            const prefix = id.slice(0, -digitMatch[0].length);
            return `${prefix}${num + 1}`;
        }
        const charCode = id.charCodeAt(id.length - 1);
        if (charCode >= 65 && charCode < 90) return id.slice(0, -1) + String.fromCharCode(charCode + 1);
        return null;
    };

    const getPrevIdFallback = (id: string) => {
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
        if (charCode > 65 && charCode <= 90) return id.slice(0, -1) + String.fromCharCode(charCode - 1);
        return null;
    };

    // Use sheet navigation if available, else fallback heuristic
    const prevId = prevProblem ? prevProblem.index : getPrevIdFallback(currentId);
    const nextId = nextProblem ? nextProblem.index : getNextIdFallback(currentId);

    // Random: pick a different problem from the sheet
    const getRandomId = () => {
        if (!sheetProblems || sheetProblems.length <= 1) return null;
        const others = sheetProblems.filter(
            (p) => p.index.toUpperCase() !== currentId.toUpperCase()
        );
        if (others.length === 0) return null;
        return others[Math.floor(Math.random() * others.length)].index;
    };

    const title = problem?.meta?.title || "Loading...";
    const showIdPrefix = problemId && !title.startsWith(problemId + ".");

    // Sheet info label
    const sheetLabel = sheetProblems
        ? `${currentIndex + 1}/${sheetProblems.length}`
        : null;

    return (
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[#121212] px-4 py-3 shrink-0">
            {/* Top Row */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                    {/* Problem List Button */}
                    {onOpenDrawer && (
                        <button
                            onClick={onOpenDrawer}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all text-xs font-medium shrink-0 border border-white/8 hover:border-white/15"
                            title="Problem List"
                        >
                            <List size={14} />
                            <span className="hidden sm:inline">Problems</span>
                            {sheetLabel && (
                                <span className="text-[10px] font-mono text-white/30 ml-0.5">
                                    {sheetLabel}
                                </span>
                            )}
                        </button>
                    )}

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            {!onOpenDrawer && (
                                <button
                                    onClick={onToggleSidebar}
                                    className="p-1.5 -ml-1.5 text-white/50 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                                    title="Toggle Sidebar"
                                >
                                    <SidebarToggleIcon size={20} />
                                </button>
                            )}
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

                    {/* Navigation Arrows + Random */}
                    <div className="flex items-center shrink-0 gap-0.5 ml-2">
                        <Link
                            href={prevId ? `${navigationBaseUrl}/${prevId}` : "#"}
                            className={`p-1.5 rounded-md active:bg-white/20 transition-all flex items-center justify-center touch-manipulation min-w-[28px] min-h-[28px] ${
                                prevId
                                    ? "text-white/70 active:text-white hover:bg-white/5"
                                    : "text-white/20 cursor-not-allowed pointer-events-none"
                            }`}
                            aria-disabled={!prevId}
                            title={prevProblem ? `Prev: ${prevProblem.name}` : "Previous problem"}
                        >
                            <ChevronLeft size={16} />
                        </Link>
                        <Link
                            href={nextId ? `${navigationBaseUrl}/${nextId}` : "#"}
                            className={`p-1.5 rounded-md active:bg-white/20 transition-all flex items-center justify-center touch-manipulation min-w-[28px] min-h-[28px] ${
                                nextId
                                    ? "text-white/70 active:text-white hover:bg-white/5"
                                    : "text-white/20 cursor-not-allowed pointer-events-none"
                            }`}
                            aria-disabled={!nextId}
                            title={nextProblem ? `Next: ${nextProblem.name}` : "Next problem"}
                        >
                            <ChevronRight size={16} />
                        </Link>
                        {sheetProblems && sheetProblems.length > 1 && (
                            <Link
                                href={(() => {
                                    const rid = getRandomId();
                                    return rid ? `${navigationBaseUrl}/${rid}` : "#";
                                })()}
                                className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-all flex items-center justify-center touch-manipulation min-w-[28px] min-h-[28px]"
                                title="Random problem"
                            >
                                <Shuffle size={14} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile View Toggle */}
                <div className="flex md:hidden bg-[#1a1a1a] p-0.5 rounded-lg border border-white/10 shrink-0">
                    <button
                        onClick={() => setMobileView("problem")}
                        className={`p-1.5 rounded-md transition-all ${
                            mobileView === "problem"
                                ? "bg-[#2a2a2a] text-white shadow-sm"
                                : "text-white/40 hover:text-white/60"
                        }`}
                    >
                        <FileText size={14} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => setMobileView("code")}
                        className={`p-1.5 rounded-md transition-all ${
                            mobileView === "code"
                                ? "bg-[#2a2a2a] text-white shadow-sm"
                                : "text-white/40 hover:text-white/60"
                        }`}
                    >
                        <Code size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Desktop Logo */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="relative flex items-center group">
                        <div className="opacity-80 hover:opacity-100 transition-opacity cursor-default">
                            <Image
                                src="/icons/logo.svg"
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
