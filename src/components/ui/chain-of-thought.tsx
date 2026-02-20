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
            <div className={cn("flex flex-col mb-4 w-full font-sans", className)}>
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
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors select-none mb-1 w-max"
        >
            <div className="flex items-center justify-center rounded-md bg-emerald-950/30 border border-emerald-900/50 p-1">
                <Sparkles size={14} className="text-emerald-500" />
            </div>
            <ChevronRight size={16} className={cn("transition-transform duration-200 text-white/40", isExpanded ? "rotate-90" : "")} />
            <span className="font-medium text-[13px] sm:text-[14px]">{title}</span>
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
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className="mt-2 ml-[19px] pl-5 border-l-2 border-white/10 relative flex flex-col gap-4 py-2">
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
            <div className="absolute -left-[29px] top-0 bg-[#1E1E24]">
                {status === "completed" ? (
                    <CheckCircle2 size={16} className="text-emerald-500/80 bg-[#1E1E24]" />
                ) : status === "in-progress" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-500/50 border-t-emerald-400 animate-spin bg-[#1E1E24]" />
                ) : (
                    <CircleDashed size={16} className="text-white/20 bg-[#1E1E24]" />
                )}
            </div>

            <div className="flex flex-col gap-1.5 pt-0.5">
                {title && <span className="text-sm font-semibold text-white/80">{title}</span>}
                <div className="text-[13px] text-white/60 leading-relaxed font-sans">
                    {children}
                </div>
            </div>
        </div>
    );
};
