'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, CheckCircle2, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChainOfThoughtContextValue {
    isExpanded: boolean;
    setIsExpanded: (val: boolean) => void;
}

const ChainOfThoughtContext = React.createContext<ChainOfThoughtContextValue>({
    isExpanded: false,
    setIsExpanded: () => { },
});

export const ChainOfThought = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    return (
        <ChainOfThoughtContext.Provider value={{ isExpanded, setIsExpanded }}>
            <div className={cn("flex flex-col mb-4 w-full font-sans overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md", isExpanded ? "pb-2" : "", className)}>
                {children}
            </div>
        </ChainOfThoughtContext.Provider>
    );
};

export const ChainOfThoughtHeader = ({ title = "Thought Process" }: { title?: string }) => {
    const { isExpanded, setIsExpanded } = React.useContext(ChainOfThoughtContext);

    return (
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 text-white/60 hover:text-white transition-all select-none w-full group",
                isExpanded ? "border-b border-white/5 bg-white/[0.03]" : "hover:bg-white/[0.03]"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center rounded-xl p-2 transition-all duration-500",
                    isExpanded ? "bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-white/5"
                )}>
                    <Sparkles size={16} className={cn("transition-colors", isExpanded ? "text-emerald-400" : "text-white/40 group-hover:text-white/60")} />
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-[13px] tracking-wide uppercase opacity-40">System Logic</span>
                    <span className="font-semibold text-[14px] sm:text-[15px]">{title}</span>
                </div>
            </div>
            <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full bg-white/5 transition-transform duration-300",
                isExpanded ? "rotate-90 bg-emerald-500/10" : ""
            )}>
                <ChevronRight size={14} className={isExpanded ? "text-emerald-400" : "text-white/40"} />
            </div>
        </button>
    );
};

export const ChainOfThoughtContent = ({ children }: { children: React.ReactNode }) => {
    const { isExpanded } = React.useContext(ChainOfThoughtContext);

    return (
        <AnimatePresence initial={false}>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                >
                    <div className="mt-4 ml-8 pl-6 border-l-2 border-emerald-500/20 relative flex flex-col gap-6 py-2 pr-6">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const ChainOfThoughtStep = ({ title, children, status = "completed" }: { title?: string, children: React.ReactNode, status?: "completed" | "in-progress" | "pending" }) => {
    return (
        <div className="relative group">
            {/* Step Marker */}
            <div className="absolute -left-[35px] top-0 p-1 rounded-full bg-[#1E1E24] shadow-xl z-20">
                {status === "completed" ? (
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[8px] rounded-full" />
                        <CheckCircle2 size={18} className="text-emerald-500 relative z-10" strokeWidth={2.5} />
                    </div>
                ) : status === "in-progress" ? (
                    <div className="relative w-[18px] h-[18px]">
                        <div className="absolute inset-0 bg-emerald-500/30 blur-[10px] rounded-full animate-pulse" />
                        <div className="w-full h-full rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin relative z-10" />
                    </div>
                ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-white/5 bg-white/5" />
                )}
            </div>

            <div className="flex flex-col gap-2 transition-all duration-300 group-hover:translate-x-1">
                {title && <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500/60">{title}</span>}
                <div className="text-[14px] text-white/70 leading-relaxed font-sans prose-invert prose-p:my-1">
                    {children}
                </div>
            </div>
        </div>
    );
};
