'use client';

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Play, Loader2, RefreshCcw, Download } from 'lucide-react';
import { ExplainerComposition, VideoScript } from './ExplainerComposition';

interface InlineVideoExplainerProps {
    script: VideoScript;
}

export default function InlineVideoExplainer({ script }: InlineVideoExplainerProps) {
    const totalDuration = useMemo(
        () => script?.scenes.reduce((acc, s) => acc + s.duration, 0) || 5,
        [script]
    );

    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (!script) return;
        setIsSharing(true);

        try {
            const res = await fetch('/api/ai/video/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script }),
            });

            if (!res.ok) {
                throw new Error('Failed to generate share link.');
            }

            const data = await res.json();
            const shareUrl = `${window.location.origin}${data.url}`;

            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSharing(false);
        }
    };

    if (!script || !script.scenes || script.scenes.length === 0) {
        return (
            <div className="mt-4 mb-2 w-full rounded-2xl border border-white/10 bg-black/40 p-8 flex items-center justify-center">
                <span className="text-white/20 text-xs italic">No video data available</span>
            </div>
        );
    }

    return (
        <div className="mt-4 mb-2 w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl group">
            {/* Player Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Play size={10} className="text-emerald-400 fill-current" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/50 tracking-wider uppercase">Video Walkthrough</span>
                </div>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    disabled={isSharing || copied}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${copied
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : isSharing
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70 hover:text-white'
                        }`}
                >
                    {isSharing ? <Loader2 size={12} className="animate-spin" /> : copied ? <Download size={12} className="opacity-0" /> : <Download size={12} style={{ transform: 'rotate(-90deg)' }} />}
                    <span className="text-[11px] font-medium tracking-wide">
                        {copied ? 'Link Copied!' : isSharing ? 'Generating Link...' : 'Share Video'}
                    </span>
                </button>
            </div>

            <div className="aspect-video relative bg-black/60 flex items-center justify-center overflow-hidden">
                <Player
                    component={ExplainerComposition as any}
                    inputProps={script as any}
                    durationInFrames={Math.round(totalDuration * 30)}
                    fps={30}
                    compositionWidth={1280}
                    compositionHeight={720}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    controls
                    autoPlay={false}
                    acknowledgeRemotionLicense
                />
            </div>
        </div>
    );
}
