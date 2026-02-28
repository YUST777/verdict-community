'use client';

import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import { Play, Loader2, RefreshCcw } from 'lucide-react';
import { ExplainerComposition, VideoScript } from './ExplainerComposition';

interface InlineVideoExplainerProps {
    script: VideoScript;
}

export default function InlineVideoExplainer({ script }: InlineVideoExplainerProps) {
    const totalDuration = useMemo(
        () => script?.scenes.reduce((acc, s) => acc + s.duration, 0) || 5,
        [script]
    );

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
