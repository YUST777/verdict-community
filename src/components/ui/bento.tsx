"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
    EditorMockup,
    AITutorMockup,
    TestRunnerMockup,
    ExtensionMockup,
    VideoMockup
} from "@/components/ui/mockups";

export default function FUIBentoGridDark() {
    return (
        <div id="features" className="pt-32 container mx-auto w-full flex flex-col px-6 sm:p-10">
            <h1 className="tracking-tight text-3xl md:text-5xl font-semibold text-white">
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
                {/* ── Card 5: AI Video Generation ── */}
                <BentoCard
                    eyebrow="AI Video"
                    title="Animated solution walkthroughs"
                    description="Generate cinematic code walkthroughs with AI narration and step-by-step visual explanations. Watch your solution come alive."
                    graphic={<VideoMockup />}
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
            <div className="relative h-64 sm:h-80 lg:min-h-[26rem] lg:flex-1 overflow-hidden">
                {graphic}
            </div>
            <div className="relative p-6 sm:p-8 z-20 bg-[#0a0a0a]">
                <div className="absolute inset-x-0 -top-12 sm:-top-16 h-12 sm:h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                    {eyebrow}
                </p>
                <p className="text-xl font-semibold tracking-tight text-gray-100">
                    {title}
                </p>
                <p className="mt-2 text-sm/6 text-gray-400">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
