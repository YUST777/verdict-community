"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PanelLeft, Link as LinkIcon } from "lucide-react";
import ExtensionGate from "@/components/core/ExtensionGate";
import ExtensionOnboardingModal from "@/components/mirror/ExtensionOnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useMotionValue, useMotionTemplate, useAnimationFrame } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { parseCodeforcesUrl, getInternalRoute } from "@/lib/parseCodeforcesUrl";
import { trackEvent } from "@/lib/analytics";

/* Grid Background */
const GridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => (
    <svg className="w-full h-full">
        <defs>
            <motion.pattern
                id="grid-pattern"
                width={size}
                height={size}
                patternUnits="userSpaceOnUse"
                x={offsetX}
                y={offsetY}
            >
                <path
                    d={`M ${size} 0 L 0 0 0 ${size}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-white/20"
                />
            </motion.pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
);

export default function WorkspaceNewTabPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [inputUrl, setInputUrl] = useState("");
    const [fetching, setFetching] = useState(false);

    // Grid state
    const gridSize = 40;
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const gridOffsetX = useMotionValue(0);
    const gridOffsetY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top } = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    useAnimationFrame(() => {
        gridOffsetX.set((gridOffsetX.get() + 0.5) % gridSize);
        gridOffsetY.set((gridOffsetY.get() + 0.5) % gridSize);
    });

    const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    const parsed = parseCodeforcesUrl(inputUrl.trim());
    const detectionLabel = parsed
        ? parsed.isSheet
            ? `Detected: Entire Sheet (Contest ${parsed.contestId})`
            : `Detected: Single Problem (${parsed.contestId}/${parsed.problemId})`
        : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parsed) return;

        setFetching(true);
        try {
            if (parsed.isSheet && (parsed.type === "contest" || parsed.type === "gym")) {
                // Navigate to first problem, the drawer will auto-load the sheet
                const route = getInternalRoute({ ...parsed, problemId: "A" });
                router.push(route);
                return;
            }

            // Single problem â navigate directly
            const route = getInternalRoute(parsed);

            trackEvent("workspace_search", {
                url: inputUrl.trim(),
                type: parsed.isSheet ? "sheet" : "problem",
                contestId: parsed.contestId,
                problemId: parsed.problemId || "N/A"
            });

            router.push(route);
        } catch (err: any) {
            console.error(err?.message || err);
        } finally {
            setFetching(false);
        }
    };

    return (
        <ExtensionGate>
            <ExtensionOnboardingModal />
            <div className="fixed inset-0 bg-[#0B0B0C] text-[#DCDCDC] z-50 flex flex-row">
                <main
                    className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-[#060606]"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                >
                    {/* Grid BG layers */}
                    <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
                        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
                    </div>
                    <motion.div
                        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                        style={{ maskImage, WebkitMaskImage: maskImage }}
                    >
                        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
                    </motion.div>
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
                        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
                    </div>

                    {/* Logo */}
                    <div className="absolute top-4 right-5 z-20 flex items-center gap-2">
                        <Image src="/icons/logo.svg" alt="Verdict.run - Get instant verdicts on your competitive programming code" width={24} height={24} className="size-6" />
                        <span className="text-sm font-bold tracking-tight text-white/60">verdict.run</span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-6">
                        <h1 className="text-2xl md:text-3xl font-semibold text-white text-center mb-10 tracking-tight">
                            What will you solve next?
                        </h1>

                        {/* Smart Search Bar */}
                        <form onSubmit={handleSubmit} className="w-full group">
                            <div className={cn(
                                "relative flex items-center w-full rounded-2xl border transition-all duration-300",
                                "bg-white/[0.03] backdrop-blur-sm",
                                parsed
                                    ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                                    : "border-white/[0.08] hover:border-white/15"
                            )}>
                                <div className="pl-5 pr-3 text-white/25">
                                    <LinkIcon size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    placeholder="Paste any Codeforces link..."
                                    className="flex-1 bg-transparent text-white py-4 pr-2 text-sm font-mono placeholder:text-white/25 focus:outline-none"
                                    autoFocus
                                />
                                <div className="pr-3">
                                    <button
                                        type="submit"
                                        disabled={!parsed || fetching}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                                            parsed && !fetching
                                                ? "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105"
                                                : "bg-white/5 text-white/20"
                                        )}
                                    >
                                        {fetching
                                            ? <Loader2 size={18} className="animate-spin" />
                                            : <ArrowRight size={18} />
                                        }
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Detection indicator */}
                        <div className="h-8 mt-3 flex items-center justify-center">
                            {detectionLabel ? (
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={detectionLabel}
                                    className={cn(
                                        "text-xs font-medium px-3 py-1 rounded-full",
                                        parsed?.isSheet
                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}
                                >
                                    {detectionLabel}
                                </motion.p>
                            ) : inputUrl.length > 0 ? (
                                <p className="text-xs text-red-400/60">Not a valid Codeforces URL</p>
                            ) : (
                                <p className="text-xs text-white/20">Auto-detects: single problem or entire sheet</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ExtensionGate>
    );
}
