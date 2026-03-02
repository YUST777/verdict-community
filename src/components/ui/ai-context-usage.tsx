'use client';

import * as React from 'react';
import { useState, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────
interface AIUsageData {
    inputTokens: number;
    outputTokens: number;
    cachedTokens: number;
    totalTokens: number;
    maxTokens: number;
    requestCount: number;
}

interface AIContextUsageContextType {
    usage: AIUsageData;
    addUsage: (input: number, output: number) => void;
    setUsageData: (data: Partial<AIUsageData>) => void;
    resetUsage: () => void;
}

const AIContextUsageContext = createContext<AIContextUsageContextType | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────────
export function useAIContextUsage() {
    const ctx = useContext(AIContextUsageContext);
    if (!ctx) throw new Error('useAIContextUsage must be used within an AIContextUsageProvider');
    return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────
interface AIContextUsageProviderProps {
    maxTokens?: number;
    children: React.ReactNode;
}

export function AIContextUsageProvider({ maxTokens = 128000, children }: AIContextUsageProviderProps) {
    const [usage, setUsage] = useState<AIUsageData>({
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        totalTokens: 0,
        maxTokens,
        requestCount: 0,
    });

    const addUsage = useCallback((input: number, output: number) => {
        setUsage(prev => {
            const newInput = prev.inputTokens + input;
            const newOutput = prev.outputTokens + output;
            return {
                ...prev,
                inputTokens: newInput,
                outputTokens: newOutput,
                totalTokens: newInput + newOutput,
                requestCount: prev.requestCount + 1,
            };
        });
    }, []);

    const setUsageData = useCallback((data: Partial<AIUsageData>) => {
        setUsage(prev => {
            const next = { ...prev, ...data };
            if (data.inputTokens !== undefined || data.outputTokens !== undefined) {
                next.totalTokens = next.inputTokens + next.outputTokens;
            }
            return next;
        });
    }, []);

    const resetUsage = useCallback(() => {
        setUsage({
            inputTokens: 0,
            outputTokens: 0,
            cachedTokens: 0,
            totalTokens: 0,
            maxTokens,
            requestCount: 0,
        });
    }, [maxTokens]);

    return (
        <AIContextUsageContext.Provider value={{ usage, addUsage, setUsageData, resetUsage }}>
            {children}
        </AIContextUsageContext.Provider>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────
function formatTokenCount(count: number): string {
    if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
}

function getUsageColor(percentage: number): string {
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 70) return '#f59e0b'; // amber
    if (percentage >= 40) return '#2cbb5d'; // emerald
    return '#6366f1';                        // indigo
}

// ── Circle Component ─────────────────────────────────────────────────────
interface AIContextCircleProps {
    className?: string;
    size?: number;
    strokeWidth?: number;
}

export function AIContextCircle({ className, size = 28, strokeWidth = 3 }: AIContextCircleProps) {
    const [isHovered, setIsHovered] = useState(false);
    const ctx = useContext(AIContextUsageContext);

    if (!ctx) return null;

    const { usage } = ctx;
    const percentage = usage.maxTokens > 0 ? Math.min((usage.totalTokens / usage.maxTokens) * 100, 100) : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = getUsageColor(percentage);

    return (
        <div className={cn("relative inline-flex", className)}>
            <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative flex items-center gap-1.5 rounded-lg px-1.5 h-7 text-[10px] font-medium transition-all hover:bg-white/5 text-white/40 hover:text-white/70"
                title="AI Token Usage"
            >
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        opacity={0.15}
                    />
                    {/* Progress arc */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                    />
                </svg>
                <span className="tabular-nums" style={{ color }}>
                    {percentage.toFixed(0)}%
                </span>
            </button>

            {/* Hover card */}
            {isHovered && (
                <div
                    className="absolute bottom-full right-0 mb-2 z-50 min-w-[220px] rounded-xl bg-[#1a1a1a] border border-white/[0.06] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Header */}
                    <div className="px-3.5 py-2.5 flex items-center gap-3">
                        <svg width={40} height={40} viewBox={`0 0 40 40`} className="transform -rotate-90 shrink-0">
                            <circle cx={20} cy={20} r={16} fill="none" stroke="white" strokeWidth={3} opacity={0.1} />
                            <circle
                                cx={20} cy={20} r={16}
                                fill="none"
                                stroke={color}
                                strokeWidth={3}
                                strokeDasharray={2 * Math.PI * 16}
                                strokeDashoffset={2 * Math.PI * 16 - (percentage / 100) * 2 * Math.PI * 16}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                            />
                        </svg>
                        <div>
                            <div className="text-xs font-semibold text-white/90">Context Window</div>
                            <div className="text-[10px] text-white/40">
                                {formatTokenCount(usage.totalTokens)} / {formatTokenCount(usage.maxTokens)} tokens
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-3.5 py-2 space-y-1.5 border-t border-white/[0.06]">
                        <UsageRow label="Input tokens" value={usage.inputTokens} color="#6366f1" />
                        <UsageRow label="Output tokens" value={usage.outputTokens} color="#10b981" />
                        <UsageRow label="Requests" value={usage.requestCount} color="#f59e0b" isCount />
                    </div>

                    {/* Footer */}
                    <div className="px-3.5 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] text-white/30">Session usage</span>
                        <span className="text-[10px] font-medium" style={{ color }}>
                            {percentage.toFixed(1)}% used
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Usage Row ────────────────────────────────────────────────────────────
function UsageRow({ label, value, color, isCount }: { label: string; value: number; color: string; isCount?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-white/50">{label}</span>
            </div>
            <span className="text-[11px] font-mono text-white/70 tabular-nums">
                {isCount ? value : formatTokenCount(value)}
            </span>
        </div>
    );
}
