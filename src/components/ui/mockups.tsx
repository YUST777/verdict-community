"use client";

import React from "react";
import { clsx } from "clsx";
import {
    Code,
    Wand2,
    Bot,
    Sparkles,
    Send,
    Plus,
    CheckCircle2,
    Clock,
    ArrowRight,
    Trophy,
    BarChart2
} from "lucide-react";
import GradientButton from "@/components/ui/button-1";

// ─────────────────────────────────────────────────────────────────────────────
// Shared — code line helper
// ─────────────────────────────────────────────────────────────────────────────

export function CodeLine({ n, tokens }: { n: number; tokens: { t: string; c: string }[] }) {
    return (
        <div className="flex hover:bg-white/[0.02] px-2 text-left">
            <span className="text-white/15 w-6 text-right mr-4 shrink-0 select-none text-[11px]">{n}</span>
            <span>
                {tokens.length === 0 ? (
                    <span>&nbsp;</span>
                ) : (
                    tokens.map((tok, i) => (
                        <span key={i} className={tok.c}>{tok.t}</span>
                    ))
                )}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 1 — Code Editor Mockup
// ─────────────────────────────────────────────────────────────────────────────

export function EditorMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-[11px] rounded-md bg-white/[0.08] text-white/70 border border-white/[0.12]">
                            Human
                        </button>
                        <button className="px-3 py-1 text-[11px] rounded-md text-white/25 border border-transparent">
                            AI
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1">
                        <Code className="size-3 text-white/30" />
                        <span className="text-white/40 text-[11px] font-mono whitespace-nowrap">GNU C++20 (64)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[11px] rounded-md bg-white/[0.04] border border-white/[0.08] text-white/40 whitespace-nowrap">
                        Run Tests
                    </span>
                    <span className="px-4 py-1 text-[11px] rounded-md bg-emerald-500 text-black font-semibold whitespace-nowrap">
                        Submit
                    </span>
                </div>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-hidden font-mono text-[12px] leading-6">
                <CodeLine n={1} tokens={[{ t: "#include", c: "text-[#c586c0]" }, { t: " <bits/stdc++.h>", c: "text-[#ce9178]" }]} />
                <CodeLine n={2} tokens={[{ t: "using", c: "text-[#569cd6]" }, { t: " ", c: "" }, { t: "namespace", c: "text-[#569cd6]" }, { t: " std;", c: "text-white/40" }]} />
                <CodeLine n={3} tokens={[]} />
                <CodeLine n={4} tokens={[{ t: "void", c: "text-[#569cd6]" }, { t: " ", c: "" }, { t: "solve", c: "text-[#dcdcaa]" }, { t: "() {", c: "text-white/40" }]} />
                <CodeLine n={5} tokens={[{ t: "    int", c: "text-[#569cd6]" }, { t: " n; ", c: "text-white/50" }, { t: "cin", c: "text-[#4ec9b0]" }, { t: " >> n;", c: "text-white/40" }]} />
                <CodeLine n={6} tokens={[{ t: "    vector", c: "text-[#4ec9b0]" }, { t: "<", c: "text-white/30" }, { t: "int", c: "text-[#569cd6]" }, { t: ">", c: "text-white/30" }, { t: " a(n);", c: "text-white/50" }]} />
                <CodeLine n={7} tokens={[{ t: "    for", c: "text-[#c586c0]" }, { t: " (", c: "text-white/40" }, { t: "auto", c: "text-[#569cd6]" }, { t: "& x : a) ", c: "text-white/50" }, { t: "cin", c: "text-[#4ec9b0]" }, { t: " >> x;", c: "text-white/40" }]} />
                <CodeLine n={8} tokens={[{ t: "    sort", c: "text-[#dcdcaa]" }, { t: "(a.", c: "text-white/40" }, { t: "begin", c: "text-[#dcdcaa]" }, { t: "(), a.", c: "text-white/40" }, { t: "end", c: "text-[#dcdcaa]" }, { t: "());", c: "text-white/40" }]} />
                <CodeLine n={9} tokens={[{ t: "    cout", c: "text-[#4ec9b0]" }, { t: " << a[", c: "text-white/40" }, { t: "0", c: "text-[#b5cea8]" }, { t: "] << ", c: "text-white/40" }, { t: "'\\n'", c: "text-[#ce9178]" }, { t: ";", c: "text-white/40" }]} />
                <CodeLine n={10} tokens={[{ t: "}", c: "text-white/40" }]} />
                <CodeLine n={11} tokens={[]} />
                <CodeLine n={12} tokens={[{ t: "int", c: "text-[#569cd6]" }, { t: " ", c: "" }, { t: "main", c: "text-[#dcdcaa]" }, { t: "() {", c: "text-white/40" }]} />
                <CodeLine n={13} tokens={[{ t: "    int", c: "text-[#569cd6]" }, { t: " t; ", c: "text-white/50" }, { t: "cin", c: "text-[#4ec9b0]" }, { t: " >> t;", c: "text-white/40" }]} />
                <CodeLine n={14} tokens={[{ t: "    while", c: "text-[#c586c0]" }, { t: " (t--) ", c: "text-white/40" }, { t: "solve", c: "text-[#dcdcaa]" }, { t: "();", c: "text-white/40" }]} />
                <CodeLine n={15} tokens={[{ t: "}", c: "text-white/40" }]} />
            </div>

            {/* Floating Ask AI button */}
            <div className="absolute bottom-20 right-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                    <Wand2 className="size-3" />
                    Ask AI
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 2 — AI Tutor Mockup
// ─────────────────────────────────────────────────────────────────────────────

export function AITutorMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col text-left">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                    <Bot className="size-4 text-emerald-400" />
                </div>
                <div>
                    <span className="text-white/80 text-sm font-medium block leading-tight">AI Tutor</span>
                    <span className="text-white/30 text-[10px]">Guided learning mode</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        Teach Me
                    </span>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 space-y-3 overflow-hidden">
                {/* User message */}
                <div className="flex justify-end">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                        <p className="text-white/80 text-[12px] leading-relaxed">
                            How do I solve this problem? I'm stuck on the greedy approach.
                        </p>
                    </div>
                </div>

                {/* AI response */}
                <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles className="size-3 text-emerald-400" />
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-white/70 text-[12px] leading-relaxed">
                            Great question! Let's think about this step by step.
                        </p>
                        <p className="text-white/70 text-[12px] leading-relaxed mt-2">
                            <span className="text-emerald-400 font-medium">Hint 1:</span> Consider sorting the array first. What property does the sorted array give you?
                        </p>
                        <p className="text-white/70 text-[12px] leading-relaxed mt-2 text-wrap">
                            <span className="text-emerald-400 font-medium">Key insight:</span> After sorting, the minimum difference between any two elements must be between adjacent elements.
                        </p>

                        {/* Code block */}
                        <div className="mt-3 bg-[#0a0a0a] border border-white/[0.06] rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-white/30 font-mono">C++</span>
                                <span className="text-[10px] text-white/20">@ lines 5-8</span>
                            </div>
                            <pre className="text-[11px] font-mono leading-5">
                                <span className="text-[#dcdcaa]">sort</span>
                                <span className="text-white/40">(a.</span>
                                <span className="text-[#dcdcaa]">begin</span>
                                <span className="text-white/40">(), a.</span>
                                <span className="text-[#dcdcaa]">end</span>
                                <span className="text-white/40">());</span>
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Difficulty selector */}
                <div className="flex gap-2 pl-8">
                    {["Easy", "Medium", "Hard"].map((level, i) => (
                        <span
                            key={level}
                            className={clsx(
                                "px-2.5 py-1 text-[10px] rounded-md border",
                                i === 1
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-white/[0.03] border-white/[0.08] text-white/30"
                            )}
                        >
                            {level}
                        </span>
                    ))}
                </div>
            </div>

            {/* Input bar */}
            <div className="mt-3 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 shrink-0">
                <input
                    type="text"
                    placeholder="Ask about this problem..."
                    className="flex-1 bg-transparent text-white/50 text-[12px] placeholder-white/20 outline-none"
                    readOnly
                />
                <Send className="size-4 text-emerald-400" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 3 — Test Runner Mockup
// ─────────────────────────────────────────────────────────────────────────────

export function TestRunnerMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col text-left">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] pb-2 mb-3 shrink-0">
                <span className="px-3 py-1.5 text-[11px] text-white/70 font-medium relative">
                    Testcase
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full" />
                </span>
                <span className="px-3 py-1.5 text-[11px] text-white/25">Test Result</span>
                <span className="px-3 py-1.5 text-[11px] text-white/25">Codeforces</span>
            </div>

            {/* Case selector */}
            <div className="flex items-center gap-1.5 mb-3 shrink-0">
                {[1, 2, 3].map((c) => (
                    <span
                        key={c}
                        className={clsx(
                            "px-3 py-1 text-[11px] rounded-md",
                            c === 1
                                ? "bg-white/[0.08] text-white/70 border border-white/[0.12]"
                                : "text-white/25 border border-transparent"
                        )}
                    >
                        Case {c}
                    </span>
                ))}
                <span className="size-6 flex items-center justify-center rounded-md text-white/20 border border-transparent">
                    <Plus className="size-3" />
                </span>
            </div>

            {/* Test data */}
            <div className="flex-1 space-y-3 overflow-hidden">
                {/* Input */}
                <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium block mb-1.5">Input</span>
                    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-lg p-3">
                        <pre className="text-white/50 text-[11px] font-mono leading-5 whitespace-pre-wrap">3{"\n"}5 2 8 1 4{"\n"}3 3 7</pre>
                    </div>
                </div>
                {/* Expected Output */}
                <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium block mb-1.5">Expected Output</span>
                    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-lg p-3">
                        <pre className="text-[11px] font-mono leading-5 whitespace-pre-wrap">
                            <span className="text-emerald-400">1</span>{"\n"}<span className="text-emerald-400">3</span>{"\n"}<span className="text-emerald-400">3</span>
                        </pre>
                    </div>
                </div>
                {/* Result */}
                <div className="flex items-center gap-2 pb-4">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-emerald-400 text-[12px] font-medium">All test cases passed</span>
                    <span className="ml-auto text-[11px] text-white/20 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="size-3" /> 46ms
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 4 — Extension Mockup (Chrome Extension Popup)
// ─────────────────────────────────────────────────────────────────────────────

export function ExtensionMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col items-center justify-center text-left">
            {/* Chrome extension popup frame */}
            <div className="w-full max-w-[260px] bg-[#0a0a0a] rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/60">
                {/* Extension header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]" style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.08) 0%, transparent 100%)' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-black text-[11px] font-bold">V</span>
                        </div>
                        <span className="text-white text-[13px] font-bold tracking-tight">
                            Verdict<span className="text-emerald-400">.run</span>
                        </span>
                    </div>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">v1.0.3</span>
                </div>

                {/* Account section */}
                <div className="px-4 pt-4 pb-3">
                    <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wider block mb-2">Codeforces Account</span>
                    <div className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-emerald-500/20">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
                            <span className="text-black text-sm font-bold">Y</span>
                        </div>
                        <div className="min-w-0">
                            <span className="text-white text-[13px] font-semibold block leading-tight">YUST777</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-400 text-[10px]">Connected</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download button */}
                <div className="mx-4 mb-3">
                    <a href="https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj" target="_blank" rel="noopener noreferrer">
                        <GradientButton width="100%" height="38px">
                            <ArrowRight className="size-3.5" />
                            Download Extension
                        </GradientButton>
                    </a>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-2 px-4 pb-4">
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-[11px] font-medium">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 3v5h-5" />
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        </svg>
                        Refresh
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500 text-black text-[11px] font-semibold">
                        Open App
                        <ArrowRight className="size-3" />
                    </div>
                </div>
            </div>

            {/* Chrome toolbar hint */}
            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-black text-[7px] font-bold">V</span>
                </div>
                <span className="text-[10px] text-white/30 whitespace-nowrap">Chrome Extension</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 5 — Analytics Mockup
// ─────────────────────────────────────────────────────────────────────────────

export function AnalyticsMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col text-left">
            {/* Global stats card */}
            <div className="relative rounded-xl overflow-hidden mb-4 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
                <div className="relative bg-[#1a1a1a]/80 border border-white/[0.06] p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20">
                            <Trophy className="size-3.5 text-purple-400" />
                        </div>
                        <div>
                            <span className="text-white/80 text-[12px] font-medium block leading-tight">Global Stats</span>
                            <span className="text-white/25 text-[10px]">Codeforces Community</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#121212] p-3 rounded-lg border border-white/[0.04]">
                            <p className="text-[10px] text-white/25 mb-0.5">Difficulty</p>
                            <p className="text-lg font-bold text-white">1400</p>
                        </div>
                        <div className="bg-[#121212] p-3 rounded-lg border border-white/[0.04]">
                            <p className="text-[10px] text-white/25 mb-0.5">Solved By</p>
                            <p className="text-lg font-bold text-white">12,847</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Runtime chart */}
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="size-3.5 text-emerald-400" />
                    <span className="text-white/60 text-[12px] font-medium">Runtime Distribution</span>
                </div>
                {/* Simulated bar chart */}
                <div className="flex items-end gap-1 h-24">
                    {[
                        { h: "20%", label: "0-15" },
                        { h: "35%", label: "15-30" },
                        { h: "85%", label: "30-60" },
                        { h: "100%", label: "60-100" },
                        { h: "60%", label: "100-200" },
                        { h: "30%", label: "200-500" },
                        { h: "12%", label: "500+" },
                    ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={clsx(
                                    "w-full rounded-t-sm",
                                    i === 3 ? "bg-emerald-400" : "bg-emerald-400/30"
                                )}
                                style={{ height: bar.h }}
                            />
                            <span className="text-[8px] text-white/15">{bar.label}</span>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-2 pb-4">
                    <span className="text-[10px] text-white/20">Runtime (ms)</span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 6 — AI Video Generation Mockup
// ─────────────────────────────────────────────────────────────────────────────

export function VideoMockup() {
    const VIDEO_URL = "/video/20a67c62-f412-4348-a015-2a8e015b7019";

    return (
        <a
            href={VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-[#0a0a0f] flex flex-col cursor-pointer group/video"
        >
            {/* Scene pill badge */}
            <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Code</span>
                </div>
            </div>

            {/* Watermark */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 opacity-40">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-black text-[7px] font-bold">V</span>
                </div>
                <span className="text-white/60 text-[10px] font-medium tracking-tight">verdict.run</span>
            </div>

            {/* Code editor area */}
            <div className="flex-1 px-4 pt-12 pb-16 overflow-hidden">
                {/* Scene header */}
                <div className="mb-3 px-2">
                    <span className="text-white/80 text-[13px] font-medium">Compute ceiling division</span>
                </div>

                {/* Code block */}
                <div className="bg-[#0d0d12] rounded-lg border border-white/[0.06] overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-white/[0.04] flex items-center justify-between">
                        <span className="text-[10px] text-white/20 font-mono">solution.cpp</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                            <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                            <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
                        </div>
                    </div>
                    <div className="font-mono text-[10px] leading-[18px] py-2">
                        <CodeLine n={1} tokens={[{ t: "#include", c: "text-[#c586c0]" }, { t: " <bits/stdc++.h>", c: "text-[#ce9178]" }]} />
                        <CodeLine n={2} tokens={[{ t: "using", c: "text-[#569cd6]" }, { t: " ", c: "" }, { t: "namespace", c: "text-[#569cd6]" }, { t: " std;", c: "text-white/40" }]} />
                        <CodeLine n={3} tokens={[{ t: "int", c: "text-[#569cd6]" }, { t: " ", c: "" }, { t: "main", c: "text-[#dcdcaa]" }, { t: "() {", c: "text-white/40" }]} />
                        <CodeLine n={4} tokens={[{ t: "    long long", c: "text-[#569cd6]" }, { t: " n, m, a;", c: "text-white/50" }]} />
                        <CodeLine n={5} tokens={[{ t: "    cin", c: "text-[#4ec9b0]" }, { t: " >> n >> m >> a;", c: "text-white/40" }]} />
                        {/* Highlighted lines */}
                        <div className="bg-emerald-500/[0.07] border-l-2 border-emerald-400">
                            <CodeLine n={6} tokens={[{ t: "    long long", c: "text-[#569cd6]" }, { t: " rows = (n+a-1)/a;", c: "text-white/60" }]} />
                        </div>
                        <div className="bg-emerald-500/[0.07] border-l-2 border-emerald-400">
                            <CodeLine n={7} tokens={[{ t: "    long long", c: "text-[#569cd6]" }, { t: " cols = (m+a-1)/a;", c: "text-white/60" }]} />
                        </div>
                        <CodeLine n={8} tokens={[{ t: "    cout", c: "text-[#4ec9b0]" }, { t: " << rows*cols << endl;", c: "text-white/40" }]} />
                        <CodeLine n={9} tokens={[{ t: "    return", c: "text-[#c586c0]" }, { t: " 0;", c: "text-white/40" }]} />
                        <CodeLine n={10} tokens={[{ t: "}", c: "text-white/40" }]} />
                    </div>
                </div>
            </div>

            {/* Caption bar at bottom */}
            <div className="absolute bottom-0 inset-x-0 z-10">
                <div className="mx-4 mb-4 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.06]">
                    <p className="text-white/80 text-[11px] leading-relaxed text-center">
                        Here is the core logic. We compute the number of rows of tiles as n plus a minus 1, integer divided by a...
                    </p>
                </div>
            </div>

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-lg shadow-emerald-500/30 backdrop-blur-sm">
                    <svg className="w-6 h-6 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </a>
    );
}
