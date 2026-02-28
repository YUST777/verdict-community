'use client';

import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import { X, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExplainerComposition, VideoScript } from './ExplainerComposition';

interface VideoExplainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    script: VideoScript | null;
    isLoading?: boolean;
}

export default function VideoExplainerModal({ isOpen, onClose, script, isLoading }: VideoExplainerModalProps) {
    if (!isOpen) return null;

    const totalDuration = script?.scenes.reduce((acc, s) => acc + s.duration, 0) || 5;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-5xl aspect-video bg-[#0e0e13] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Play size={14} className="text-emerald-400 fill-current" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white/90">AI Video Explainer</h3>
                                <p className="text-[10px] text-white/30 truncate max-w-[300px]">{script?.title || 'Generating script...'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/5 text-white/25 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 size={32} className="animate-spin text-emerald-500 opacity-50" />
                                <span className="text-xs font-medium text-white/40 tracking-widest uppercase">
                                    AI Brain Cooking Script...
                                </span>
                            </div>
                        ) : script ? (
                            <Player
                                component={ExplainerComposition}
                                inputProps={script}
                                durationInFrames={Math.round(totalDuration * 30)}
                                fps={30}
                                compositionWidth={1280}
                                compositionHeight={720}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                controls
                                autoPlay
                                loop
                                acknowledgeRemotionLicense
                            />
                        ) : (
                            <div className="text-white/20 text-sm">Failed to load video script.</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
