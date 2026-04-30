'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { ExplainerComposition, VideoScript } from '@/components/mirror/video/ExplainerComposition';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ClientPage({ script }: { script: VideoScript }) {
    const totalDuration = script?.scenes?.reduce((acc, s) => acc + s.duration, 0) || 5;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center">
            <div className="w-full max-w-7xl p-4 flex items-center justify-between border-b border-white/5 shrink-0">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back to Verdict</span>
                </Link>
                <div className="text-sm font-semibold tracking-wider uppercase text-white/30">Shared Video Walkthrough</div>
                <div className="w-20" /> {/* Spacer */}
            </div>

            <div className="flex-1 w-full max-w-7xl flex items-center justify-center p-6 md:p-12">
                <div className="w-full relative bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
                    {/* The player maintains aspect ratio automatically when width is 100% */}
                    <Player
                        component={ExplainerComposition as any}
                        inputProps={script as any}
                        durationInFrames={Math.round(totalDuration * 30)}
                        fps={30}
                        compositionWidth={1920}
                        compositionHeight={1080}
                        style={{
                            width: '100%',
                            aspectRatio: '16/9',
                        }}
                        controls
                        autoPlay
                        loop
                        acknowledgeRemotionLicense
                    />
                </div>
            </div>
        </div>
    );
}
