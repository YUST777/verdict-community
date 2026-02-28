'use client';

import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
    weights: ["400", "700", "900"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true
});

export interface Scene {
    id: string;
    type: 'title' | 'code' | 'concept' | 'problem' | 'summary';
    duration: number;
    text: string;
    script: string;
    svg?: string;
    code?: string;
    highlight?: [number, number];
}

export interface VideoScript {
    title: string;
    scenes: Scene[];
}

// ─── RTL detection helper ─────────────────────────────────────────────────
const isRTL = (text: string): boolean => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

const textDir = (text: string) => isRTL(text) ? 'rtl' as const : 'ltr' as const;
const textAlign = (text: string) => isRTL(text) ? 'right' as const : 'left' as const;

// ─── Shared dot-grid background ───────────────────────────────────────────
const DotGrid: React.FC = () => (
    <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
        }}
    />
);

// ─── Shared caption bar (word-by-word reveal) ─────────────────────────────
const CaptionBar: React.FC<{ script: string }> = ({ script }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const words = script.split(' ');
    const wordsPerSecond = 3.0;
    const totalRevealFrames = Math.max(1, (words.length / wordsPerSecond) * fps);
    const wordsToShow = Math.min(
        words.length,
        Math.floor(interpolate(frame, [0, totalRevealFrames], [0, words.length], { extrapolateRight: 'clamp' }))
    );

    const opacity = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const visibleText = words.slice(0, wordsToShow).join(' ');

    if (!script || !visibleText) return null;

    const rtl = isRTL(script);

    return (
        <div className="absolute bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-5 px-16 pointer-events-none" style={{ opacity }}>
            <div className="px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur-sm max-w-[75%]" style={{ fontFamily }}>
                <p
                    className="text-[16px] font-medium text-white/80 text-center leading-relaxed"
                    style={{ direction: rtl ? 'rtl' : 'ltr' }}
                >
                    {visibleText}
                </p>
            </div>
        </div>
    );
};

// ─── Pill badge component ─────────────────────────────────────────────────
const PillBadge: React.FC<{ label: string, color?: 'emerald' | 'blue' | 'amber' }> = ({ label, color = 'emerald' }) => {
    const colors = {
        emerald: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
        blue: 'bg-blue-500/15 border-blue-500/25 text-blue-400',
        amber: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    };

    return (
        <div
            className={`inline-flex px-4 py-1.5 rounded-full border text-[11px] font-black tracking-[0.25em] uppercase ${colors[color]}`}
            style={{ direction: isRTL(label) ? 'rtl' : 'ltr', letterSpacing: isRTL(label) ? '0' : undefined }}
        >
            {label}
        </div>
    );
};

// ─── Title Scene ──────────────────────────────────────────────────────────
const TitleScene: React.FC<{ title: string, script: string }> = ({ title, script }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: 'clamp' });
    const lineWidth = interpolate(frame, [20, 50], [0, 120], { extrapolateRight: 'clamp' });
    const badgeOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
    const rtl = isRTL(title);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f', fontFamily }} className="flex items-center justify-center overflow-hidden">
            <DotGrid />

            <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] bg-emerald-500/[0.04] rounded-full blur-[150px]" />
            <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-[60%] bg-blue-500/[0.03] rounded-full blur-[150px]" />

            <div className="relative z-10 text-center px-16 max-w-[1000px]">
                <div style={{ opacity: badgeOpacity }} className="mb-8">
                    <PillBadge label={rtl ? '\u0634\u0631\u062d \u0627\u0644\u062d\u0644' : 'Solution Walkthrough'} />
                </div>

                <h1
                    className="text-[72px] font-[900] text-white leading-[1.05]"
                    style={{
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                        direction: textDir(title),
                        letterSpacing: rtl ? '0' : '-0.03em',
                    }}
                >
                    {title}
                </h1>

                <div className="mt-10 mx-auto h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-500/0 rounded-full" style={{ width: lineWidth }} />
            </div>

            <CaptionBar script={script} />
        </AbsoluteFill>
    );
};

// ─── Problem Scene ────────────────────────────────────────────────────────
const ProblemScene: React.FC<{ text: string, script: string, svg?: string }> = ({ text, script, svg }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const textOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
    const textY = interpolate(frame, [0, 22], [30, 0], { extrapolateRight: 'clamp' });
    const badgeOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
    const lineWidth = interpolate(frame, [15, 40], [0, 100], { extrapolateRight: 'clamp' });
    const rtl = isRTL(text);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f', fontFamily }} className="flex flex-col justify-center overflow-hidden">
            <DotGrid />

            <div className="absolute top-[-20%] right-[-15%] w-[50%] h-[50%] bg-emerald-500/[0.04] rounded-full blur-[140px]" />

            <div className={`relative z-10 px-20 max-w-[1100px] flex ${svg ? (rtl ? 'flex-row' : 'flex-row') : 'flex-col'} items-center gap-12`} style={{ direction: textDir(text), alignSelf: svg ? 'center' : (rtl ? 'flex-end' : 'flex-start') }}>
                <div className="flex-1">
                    <div style={{ opacity: badgeOpacity }} className="mb-6">
                        <PillBadge label={rtl ? '\u0627\u0644\u0645\u0633\u0623\u0644\u0629' : 'Problem'} color="emerald" />
                    </div>

                    <p
                        className="text-[52px] font-[900] text-white leading-[1.15]"
                        style={{
                            opacity: textOpacity,
                            transform: `translateY(${textY}px)`,
                            textAlign: textAlign(text),
                            letterSpacing: rtl ? '0' : '-0.02em',
                        }}
                    >
                        {text}
                    </p>

                    <div
                        className="mt-10 h-[3px] rounded-full"
                        style={{
                            width: lineWidth,
                            background: rtl
                                ? 'linear-gradient(to left, #10b981, transparent)'
                                : 'linear-gradient(to right, #10b981, transparent)',
                            marginLeft: rtl ? 'auto' : 0,
                            marginRight: rtl ? 0 : 'auto',
                        }}
                    />
                </div>
                {svg && (
                    <div
                        className="flex-1 w-full max-w-[450px]"
                        style={{ opacity: textOpacity, transform: `translateY(${textY}px)` }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                )}
            </div>

            <CaptionBar script={script} />
        </AbsoluteFill>
    );
};

// ─── Concept Scene ────────────────────────────────────────────────────────
const ConceptScene: React.FC<{ text: string, script: string, svg?: string }> = ({ text, script, svg }) => {
    const frame = useCurrentFrame();

    const textOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
    const textScale = interpolate(frame, [0, 22], [0.95, 1], { extrapolateRight: 'clamp' });
    const badgeOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
    const subtextOpacity = interpolate(frame, [20, 35], [0, 0.5], { extrapolateRight: 'clamp' });
    const rtl = isRTL(text);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f', fontFamily }} className="flex items-center justify-center overflow-hidden">
            <DotGrid />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 text-center px-20 max-w-[1100px] flex flex-col items-center">
                <div style={{ opacity: badgeOpacity }} className="mb-8">
                    <PillBadge label={rtl ? '\u0627\u0644\u0641\u0643\u0631\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629' : 'Key Insight'} color="blue" />
                </div>

                {svg && (
                    <div
                        className="mb-8 w-full max-w-[400px] h-[220px]"
                        style={{ opacity: textOpacity, transform: `scale(${textScale})` }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                )}

                <p
                    className="text-[56px] font-[900] text-white leading-[1.15]"
                    style={{
                        opacity: textOpacity,
                        transform: `scale(${textScale})`,
                        direction: textDir(text),
                        textAlign: 'center',
                        letterSpacing: rtl ? '0' : '-0.02em',
                    }}
                >
                    {text}
                </p>

                <div className="mt-12 flex justify-center items-center gap-2" style={{ opacity: subtextOpacity }}>
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                    <div className="w-2 h-2 rounded-full bg-white/15" />
                </div>
            </div>

            <CaptionBar script={script} />
        </AbsoluteFill>
    );
};

// ─── Code Scene ───────────────────────────────────────────────────────────
const CodeScene: React.FC<{ text: string, code: string, highlight?: [number, number], script: string }> = ({ text, code, highlight, script }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
    const codeSlide = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

    const lines = useMemo(() => code.split('\n'), [code]);

    const scrollOffset = useMemo(() => {
        if (!highlight) return 0;
        const mid = (highlight[0] + highlight[1]) / 2;
        const lineH = 24;
        const containerH = 420;
        return Math.max(0, (mid - 1) * lineH - containerH / 2 + lineH / 2);
    }, [highlight]);

    const highlightLine = (line: string) => {
        let s = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        s = s.replace(/(\/\/.*)/g, '<span style="color:#4b5563;font-style:italic">$1</span>');
        s = s.replace(/(&quot;.*?&quot;|'.*?')/g, '<span style="color:#fbbf24">$1</span>');
        s = s.replace(/\b(#include|int|long|double|float|char|string|void|bool|if|else|for|while|return|main|using|namespace|std|cin|cout|endl|auto|const|struct|class|break|continue|switch|case|do|true|false|nullptr)\b/g, '<span style="color:#60a5fa;font-weight:700">$1</span>');
        s = s.replace(/\b(vector|map|set|pair|push_back|emplace_back|size|length|priority_queue|stack|queue|deque|sort|max|min|abs|swap|reverse|find|begin|end|insert|erase|count|lower_bound|upper_bound|make_pair|first|second)\b/g, '<span style="color:#34d399;font-weight:600">$1</span>');
        s = s.replace(/\b(\d+)\b/g, '<span style="color:#c084fc">$1</span>');
        return s;
    };

    const rtl = isRTL(text);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f', fontFamily }} className="flex flex-col p-8 overflow-hidden">
            <DotGrid />

            <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-blue-500/[0.03] rounded-full blur-[140px]" />

            {/* Header */}
            <div className="relative z-10 mb-4" style={{ opacity, direction: textDir(text) }}>
                <div className="mb-3">
                    <PillBadge label={rtl ? '\u0627\u0644\u0643\u0648\u062f' : 'Code'} color="blue" />
                </div>
                <h2
                    className="text-[28px] font-[900] text-white leading-tight"
                    style={{ textAlign: textAlign(text), letterSpacing: rtl ? '0' : '-0.02em' }}
                >
                    {text}
                </h2>
            </div>

            {/* Code editor — always LTR (code is always LTR) */}
            <div
                className="flex-1 relative z-10 bg-[#111116] rounded-xl border border-white/[0.06] overflow-hidden"
                style={{
                    transform: `translateY(${(1 - codeSlide) * 20}px)`,
                    opacity: codeSlide
                }}
            >
                <div className="flex items-center px-4 py-2 border-b border-white/[0.04]">
                    <div className="flex gap-1.5 mr-4">
                        <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                        <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                        <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                    </div>
                    <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">solution.cpp</span>
                </div>

                <div
                    className="p-4 font-mono text-[13px] leading-[24px] transition-transform duration-700 ease-out"
                    style={{ transform: `translateY(-${scrollOffset}px)`, direction: 'ltr' }}
                >
                    {lines.map((line, i) => {
                        const isHL = highlight && (i + 1 >= highlight[0] && i + 1 <= highlight[1]);
                        return (
                            <div
                                key={i}
                                className={`flex items-start px-3 py-[1px] rounded transition-all duration-300 ${isHL
                                    ? 'bg-emerald-500/[0.08] border-l-2 border-emerald-400'
                                    : 'border-l-2 border-transparent'
                                    }`}
                            >
                                <span className={`select-none inline-block w-7 text-right mr-5 text-[12px] ${isHL ? 'text-emerald-400/50' : 'text-white/10'}`}>
                                    {i + 1}
                                </span>
                                <code
                                    className={`whitespace-pre flex-1 ${isHL ? 'text-white/90' : 'text-white/25'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: isHL
                                            ? highlightLine(line)
                                            : line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <CaptionBar script={script} />
        </AbsoluteFill>
    );
};

// ─── Summary Scene ────────────────────────────────────────────────────────
const SummaryScene: React.FC<{ text: string, script: string }> = ({ text, script }) => {
    const frame = useCurrentFrame();

    const textOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
    const textY = interpolate(frame, [0, 22], [25, 0], { extrapolateRight: 'clamp' });
    const badgeOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
    const rtl = isRTL(text);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f', fontFamily }} className="flex items-center justify-center overflow-hidden">
            <DotGrid />

            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/[0.03] rounded-full blur-[140px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[140px]" />

            <div className="relative z-10 text-center px-20 max-w-[1000px]">
                <div style={{ opacity: badgeOpacity }} className="mb-8">
                    <PillBadge label={rtl ? '\u0627\u0644\u062a\u0639\u0642\u064a\u062f' : 'Complexity'} color="amber" />
                </div>

                <p
                    className="text-[52px] font-[900] text-white leading-[1.2]"
                    style={{
                        opacity: textOpacity,
                        transform: `translateY(${textY}px)`,
                        direction: textDir(text),
                        textAlign: 'center',
                        letterSpacing: rtl ? '0' : '-0.02em',
                    }}
                >
                    {text}
                </p>

                <div className="mt-10 flex justify-center gap-2" style={{ opacity: textOpacity }}>
                    <div className="h-[3px] w-8 bg-emerald-500 rounded-full" />
                    <div className="h-[3px] w-8 bg-blue-500 rounded-full" />
                    <div className="h-[3px] w-3 bg-white/10 rounded-full" />
                </div>
            </div>

            <CaptionBar script={script} />
        </AbsoluteFill>
    );
};

// ─── Main Composition ─────────────────────────────────────────────────────
export const ExplainerComposition: React.FC<VideoScript> = ({ title, scenes }) => {
    let currentStartFrame = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
            {scenes.map((scene) => {
                const durationInFrames = Math.round(scene.duration * 30);
                const startFrame = currentStartFrame;
                currentStartFrame += durationInFrames;

                return (
                    <Sequence key={scene.id} from={startFrame} durationInFrames={durationInFrames}>
                        {scene.type === 'title' && <TitleScene title={title} script={scene.script} />}
                        {scene.type === 'problem' && <ProblemScene text={scene.text} script={scene.script} svg={scene.svg} />}
                        {scene.type === 'concept' && <ConceptScene text={scene.text} script={scene.script} svg={scene.svg} />}
                        {scene.type === 'summary' && <SummaryScene text={scene.text} script={scene.script} />}
                        {scene.type === 'code' && (
                            <CodeScene
                                text={scene.text}
                                code={scene.code || ''}
                                highlight={scene.highlight}
                                script={scene.script}
                            />
                        )}
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
