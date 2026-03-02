'use client';

import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Audio } from 'remotion';

// Use standard font-family string fallback instead of async loader for server-side reliability
const fontFamily = "Inter, sans-serif";


export interface Scene {
    id: string;
    type: 'title' | 'code' | 'concept' | 'problem' | 'summary';
    duration: number;
    text: string;
    script: string;
    svg?: string;
    code?: string;
    highlight?: [number, number];
    audioData?: string;
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

// ─── Branding Watermark ───────────────────────────────────────────────────
const BrandingWatermark: React.FC<{ isRtlText: boolean }> = ({ isRtlText }) => {
    // If text is RTL (Arabic), tag goes top-right, so logo goes top-left.
    // If text is LTR (English), tag goes top-left, so logo goes top-right.
    const positionClass = isRtlText ? 'top-8 left-10' : 'top-8 right-10';

    return (
        <div className={`absolute ${positionClass} z-50 flex items-center gap-2.5 opacity-40`}>
            <Img
                src={staticFile('icons/logo.svg')}
                className="w-6 h-6 rounded"
            />
            <span className="text-white font-bold tracking-wider text-[14px]">verdict.run</span>
        </div>
    );
};


// ─── Shared caption bar (word-by-word reveal) ─────────────────────────────
const CaptionBar: React.FC<{ script: string }> = ({ script = '' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const words = script ? script.split(' ') : [];
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
                    {words.map((word, i) => (
                        <span key={i} style={{ opacity: i < wordsToShow ? 1 : 0 }}>
                            {word}{' '}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
};

// ─── Pill badge component ─────────────────────────────────────────────────
const PillBadge: React.FC<{ label: string, color?: 'emerald' | 'blue' | 'amber', isRtlText: boolean, isOverlay?: boolean }> = ({ label, color = 'emerald', isRtlText, isOverlay = true }) => {
    const colors = {
        emerald: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
        blue: 'bg-blue-500/15 border-blue-500/25 text-blue-400',
        amber: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    };

    // If overlay is true, we absolutely position it in the top corner.
    // If text is RTL (Arabic), tag goes top-right.
    // If text is LTR (English), tag goes top-left.
    const positionClass = isOverlay
        ? (isRtlText ? 'absolute top-8 right-10 z-50' : 'absolute top-8 left-10 z-50')
        : '';

    return (
        <div
            className={`${positionClass} inline-flex px-4 py-1.5 rounded-full border text-[11px] font-black tracking-[0.25em] uppercase ${colors[color]}`}
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
            <BrandingWatermark isRtlText={rtl} />
            <DotGrid />

            <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[60%] bg-emerald-500/[0.04] rounded-full blur-[150px]" />
            <div className="absolute bottom-[-30%] left-[-20%] w-[60%] h-[60%] bg-blue-500/[0.03] rounded-full blur-[150px]" />

            <div style={{ opacity: badgeOpacity }}>
                <PillBadge label={rtl ? '\u0634\u0631\u062d \u0627\u0644\u062d\u0644' : 'Solution Walkthrough'} isRtlText={rtl} />
            </div>

            <div className="relative z-10 text-center px-16 max-w-[1000px]">
                <h1
                    className="text-[72px] font-[900] text-white leading-[1.05]"
                    style={{
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                        direction: textDir(title || ''),
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
            <BrandingWatermark isRtlText={rtl} />
            <DotGrid />

            <div className="absolute top-[-20%] right-[-15%] w-[50%] h-[50%] bg-emerald-500/[0.04] rounded-full blur-[140px]" />

            <div style={{ opacity: badgeOpacity }}>
                <PillBadge label={rtl ? '\u0627\u0644\u0645\u0633\u0623\u0644\u0629' : 'Problem'} color="emerald" isRtlText={rtl} />
            </div>

            <div className={`relative z-10 px-20 max-w-[1100px] flex ${svg ? (rtl ? 'flex-row-reverse' : 'flex-row') : 'flex-col'} items-center gap-12`} style={{ direction: textDir(text || ''), alignSelf: svg ? 'center' : (rtl ? 'flex-end' : 'flex-start') }}>
                <div className="flex-1">
                    <p
                        className="text-[52px] font-[900] text-white leading-[1.15]"
                        style={{
                            opacity: textOpacity,
                            transform: `translateY(${textY}px)`,
                            textAlign: textAlign(text || ''),
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
            <BrandingWatermark isRtlText={rtl} />
            <DotGrid />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div style={{ opacity: badgeOpacity }}>
                <PillBadge label={rtl ? '\u0627\u0644\u0641\u0643\u0631\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629' : 'Key Insight'} color="blue" isRtlText={rtl} />
            </div>

            <div className="relative z-10 text-center px-20 max-w-[1100px] flex flex-col items-center">
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
                        direction: textDir(text || ''),
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
    const badgeOpacity = opacity;
    const codeSlide = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

    const lines = useMemo(() => (code || '').split('\n'), [code]);

    const { height: videoHeight } = useVideoConfig();
    const scrollOffset = useMemo(() => {
        if (!highlight) return 0;
        const mid = (highlight[0] + highlight[1]) / 2;
        const lineH = 24;

        // Target vertical center: ~200px from the top of the code window
        const optimalOffset = 200;

        // Start scrolling early, keep the active line roughly 200px from the top
        return Math.max(0, (mid - 1) * lineH - optimalOffset);
    }, [highlight, videoHeight]);

    const highlightLine = (line: string) => {
        let s = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Token-based approach: each regex match is replaced with a safe placeholder
        // to prevent later regexes from corrupting already-inserted HTML spans.
        const tokens: string[] = [];
        const tok = (html: string) => { tokens.push(html); return `__TOK_${tokens.length - 1}__`; };

        // Comments
        s = s.replace(/(\/\/.*)/g, (_, m) => tok(`<span style="color:#4b5563;font-style:italic">${m}</span>`));
        // Strings
        s = s.replace(/(".*?"|'.*?')/g, (_, m) => tok(`<span style="color:#fbbf24">${m}</span>`));
        // Keywords
        s = s.replace(/\b(#include|int|long|double|float|char|string|void|bool|if|else|for|while|return|main|using|namespace|std|cin|cout|endl|auto|const|struct|class|break|continue|switch|case|do|true|false|nullptr)\b/g, (_, m) => tok(`<span style="color:#60a5fa;font-weight:700">${m}</span>`));
        // STL / built-in functions
        s = s.replace(/\b(vector|map|set|pair|push_back|emplace_back|size|length|priority_queue|stack|queue|deque|sort|max|min|abs|swap|reverse|find|begin|end|insert|erase|count|lower_bound|upper_bound|make_pair|first|second)\b/g, (_, m) => tok(`<span style="color:#34d399;font-weight:600">${m}</span>`));
        // Numbers (now safe — keywords are already replaced with __TOK_N__ tokens)
        s = s.replace(/\b(\d+)\b/g, (_, m) => tok(`<span style="color:#c084fc">${m}</span>`));

        // Restore all tokens
        s = s.replace(/__TOK_(\d+)__/g, (_, idx) => tokens[parseInt(idx)]);
        return s;
    };

    const rtl = isRTL(text);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f', fontFamily }} className="flex flex-col p-8 overflow-hidden">
            <BrandingWatermark isRtlText={rtl} />
            <DotGrid />

            <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-blue-500/[0.03] rounded-full blur-[140px]" />

            <div style={{ opacity: badgeOpacity }}>
                <PillBadge label={rtl ? '\u0627\u0644\u0643\u0648\u062f' : 'Code'} color="blue" isRtlText={rtl} />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-4 mt-8" style={{ opacity, direction: textDir(text) }}>
                <h2
                    className="text-[28px] font-[900] text-white leading-tight"
                    style={{ textAlign: textAlign(text), letterSpacing: rtl ? '0' : '-0.02em' }}
                >
                    {text}
                </h2>
            </div>

            {/* Code editor — always LTR (code is always LTR) */}
            <div
                className="flex-1 relative z-10 bg-[#111116] rounded-xl border border-white/[0.06] overflow-hidden flex flex-col"
                style={{
                    transform: `translateY(${(1 - codeSlide) * 20}px)`,
                    opacity: codeSlide
                }}
            >
                <div className="flex items-center px-4 py-2 border-b border-white/[0.04] bg-[#111116] relative z-20 shrink-0">
                    <div className="flex gap-1.5 mr-4">
                        <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                        <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                        <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                    </div>
                    <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">solution.cpp</span>
                </div>

                {/* Inner mask to properly clip scrolling code before it hits the header */}
                <div className="flex-1 relative overflow-hidden">
                    <div
                        className="p-4 font-mono text-[13px] leading-[24px] transition-transform duration-700 ease-out absolute left-0 right-0 top-0"
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
            <BrandingWatermark isRtlText={rtl} />
            <DotGrid />

            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/[0.03] rounded-full blur-[140px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/[0.03] rounded-full blur-[140px]" />

            <div style={{ opacity: badgeOpacity }}>
                <PillBadge label={rtl ? '\u0627\u0644\u062a\u0639\u0642\u064a\u062f' : 'Complexity'} color="amber" isRtlText={rtl} />
            </div>

            <div className="relative z-10 text-center px-20 max-w-[1000px]">
                <p
                    className="text-[52px] font-[900] text-white leading-[1.2]"
                    style={{
                        opacity: textOpacity,
                        transform: `translateY(${textY}px)`,
                        direction: textDir(text || ''),
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
export const ExplainerComposition: React.FC<VideoScript> = ({ title, scenes = [] }) => {
    // Pre-calculate cumulative start frames to avoid mutable variables during render
    const sceneFrames = useMemo(() => {
        let cumulative = 0;
        return scenes.map((scene) => {
            const startFrame = cumulative;
            const durationInFrames = Math.round(scene.duration * 30);
            cumulative += durationInFrames;
            return { startFrame, durationInFrames };
        });
    }, [scenes]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0f' }}>
            {scenes.map((scene, idx) => {
                const { startFrame, durationInFrames } = sceneFrames[idx];

                return (
                    <Sequence key={scene.id || idx} from={startFrame} durationInFrames={durationInFrames}>
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
                        {scene.audioData && <Audio src={scene.audioData} />}
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
