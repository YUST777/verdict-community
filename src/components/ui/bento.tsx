"use client";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import GradientButton from "@/components/ui/button-1";
import {
    CheckCircle2,
    Clock,
    Wand2,
    Send,
    Play,
    ArrowRight,
    BarChart2,
    Trophy,
    Plus,
    Sparkles,
    Code,
    Bot,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Main bento grid
// ─────────────────────────────────────────────────────────────────────────────

export default function FUIBentoGridDark() {
    return (
        <div id="features" className="pt-32 container mx-auto w-full flex flex-col px-6 sm:p-10">
            <h1 className="tracking-tight text-3xl md:text-5xl font-semibold">
                Features
            </h1>
            <p className="max-w-3xl text-2xl/8 font-medium tracking-tight mt-2 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                Everything you need to solve competitive programming problems.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
                {/* ── Card 1: Code Editor ── */}
                <BentoCard
                    eyebrow="Editor"
                    title="Full-featured code editor"
                    description="Monaco-powered editor with syntax highlighting for 8 languages — C++, Python, Java, Go, Rust, Kotlin, C#, and Node.js. Dual tabs for your code and AI-generated solutions."
                    graphic={<EditorMockup />}
                    className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
                />
                {/* ── Card 2: AI Tutor ── */}
                <BentoCard
                    eyebrow="AI Tutor"
                    title="Learn, don't just copy"
                    description="An AI tutor that teaches you the approach step-by-step with hints, concept explanations, and guided solutions at 3 difficulty levels — not just raw answers."
                    graphic={<AITutorMockup />}
                    className="lg:col-span-3 lg:rounded-tr-4xl"
                />
                {/* ── Card 3: Test Runner ── */}
                <BentoCard
                    eyebrow="Testing"
                    title="Run tests instantly"
                    description="Test against sample cases or add your own custom test cases. See input, expected output, and actual output side-by-side with verdict highlighting."
                    graphic={<TestRunnerMockup />}
                    className="lg:col-span-2 lg:rounded-bl-4xl"
                />
                {/* ── Card 4: Extension ── */}
                <BentoCard
                    eyebrow="Extension"
                    title="One-click submit to Codeforces"
                    description="Install the Verdict Helper Chrome extension. Submit code directly to Codeforces from verdict.run — no copy-paste, no tab switching. Uses your existing CF session securely."
                    graphic={<ExtensionMockup />}
                    className="lg:col-span-2"
                />
                {/* ── Card 5: Analytics ── */}
                <BentoCard
                    eyebrow="Analytics"
                    title="Performance insights"
                    description="See runtime and memory distributions across all accepted solutions. Compare your performance against the global Codeforces community."
                    graphic={<AnalyticsMockup />}
                    className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// BentoCard shell
// ─────────────────────────────────────────────────────────────────────────────

export function BentoCard({
    className = "",
    eyebrow,
    title,
    description,
    graphic,
}: {
    className?: string;
    eyebrow: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    graphic?: React.ReactNode;
}) {
    return (
        <motion.div
            initial="idle"
            whileHover="active"
            variants={{ idle: {}, active: {} }}
            className={clsx(
                className,
                "group relative flex flex-col overflow-hidden rounded-lg",
                "bg-white/[0.03] border border-white/[0.08] shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] backdrop-blur-sm"
            )}
        >
            <div className="relative h-80 sm:h-[26rem] shrink-0 overflow-hidden">
                {graphic}
            </div>
            <div className="relative p-8 z-20 bg-[#0a0a0a]">
                <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                    {eyebrow}
                </p>
                <p className="text-xl font-semibold tracking-tight text-gray-100">
                    {title}
                </p>
                <p className="mt-2 max-w-[600px] text-sm/6 text-gray-400">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 1 — Code Editor Mockup
// ─────────────────────────────────────────────────────────────────────────────

function EditorMockup() {
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
                        <span className="text-white/40 text-[11px] font-mono">GNU C++20 (64)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[11px] rounded-md bg-white/[0.04] border border-white/[0.08] text-white/40">
                        Run Tests
                    </span>
                    <span className="px-4 py-1 text-[11px] rounded-md bg-emerald-500 text-black font-semibold">
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

function AITutorMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col">
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
                            How do I solve this problem? I&apos;m stuck on the greedy approach.
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
                            Great question! Let&apos;s think about this step by step.
                        </p>
                        <p className="text-white/70 text-[12px] leading-relaxed mt-2">
                            <span className="text-emerald-400 font-medium">Hint 1:</span> Consider sorting the array first. What property does the sorted array give you?
                        </p>
                        <p className="text-white/70 text-[12px] leading-relaxed mt-2">
                            <span className="text-emerald-400 font-medium">Key insight:</span> After sorting, the minimum difference between any two elements must be between{" "}
                            <span className="text-white/90 bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px] font-mono">adjacent</span> elements.
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

function TestRunnerMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col">
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
                        <pre className="text-white/50 text-[11px] font-mono leading-5">3{"\n"}5 2 8 1 4{"\n"}3 3 7</pre>
                    </div>
                </div>
                {/* Expected Output */}
                <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium block mb-1.5">Expected Output</span>
                    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-lg p-3">
                        <pre className="text-[11px] font-mono leading-5">
                            <span className="text-emerald-400">1</span>{"\n"}<span className="text-emerald-400">3</span>{"\n"}<span className="text-emerald-400">3</span>
                        </pre>
                    </div>
                </div>
                {/* Result */}
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span className="text-emerald-400 text-[12px] font-medium">All test cases passed</span>
                    <span className="ml-auto text-[11px] text-white/20 flex items-center gap-1">
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

function ExtensionMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col items-center justify-center">
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
                    <a href="https://github.com/YUST777/verdict-community/tree/main/extension" target="_blank" rel="noopener noreferrer">
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
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
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
                <span className="text-[10px] text-white/30">Chrome Extension</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic 5 — Analytics Mockup
// ─────────────────────────────────────────────────────────────────────────────

function AnalyticsMockup() {
    return (
        <div className="absolute inset-0 bg-[#0d0d0d] p-4 pt-6 flex flex-col">
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
                <div className="text-center mt-2">
                    <span className="text-[10px] text-white/20">Runtime (ms)</span>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared — code line helper
// ─────────────────────────────────────────────────────────────────────────────

function CodeLine({ n, tokens }: { n: number; tokens: { t: string; c: string }[] }) {
    return (
        <div className="flex hover:bg-white/[0.02] px-2">
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
