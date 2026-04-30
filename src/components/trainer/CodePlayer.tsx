'use client';

import { useState, useEffect, useRef } from 'react';
import { TrainerScript } from '@/types/trainer';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface CodePlayerProps {
    initialCode?: string;
    script: TrainerScript;
    language?: 'en' | 'ar';
}

export default function CodePlayer({ initialCode = '', script, language = 'en' }: CodePlayerProps) {
    const [code, setCode] = useState(initialCode);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Track processed events to avoid re-applying them
    const processedEvents = useRef<Set<number>>(new Set());

    useEffect(() => {
        let animationFrameId: number;

        const tick = () => {
            if (!audioRef.current || !isPlaying) return;

            const currentTimeMs = audioRef.current.currentTime * 1000;

            script.events.forEach((event, index) => {
                // If event happened in the past and hasn't been processed yet
                if (event.timestamp <= currentTimeMs && !processedEvents.current.has(index)) {

                    if (event.type === 'type') {
                        setCode((prev) => prev + event.payload);
                    } else if (event.type === 'delete') {
                        setCode((prev) => prev.slice(0, -1));
                    } else if (event.type === 'reset') {
                        setCode(event.payload);
                    }

                    processedEvents.current.add(index);
                }
            });

            // Stop if audio ended
            if (audioRef.current.ended) {
                setIsPlaying(false);
                return;
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(tick);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, script]);

    // Handle Seeking (Critical for UX)
    const handleSeek = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        const seekTimeMs = e.currentTarget.currentTime * 1000;

        // Replay state from scratch to seek point
        let tempCode = initialCode;
        const newProcessed = new Set<number>();

        script.events.forEach((event, index) => {
            if (event.timestamp <= seekTimeMs) {
                if (event.type === 'type') tempCode += event.payload;
                if (event.type === 'delete') tempCode = tempCode.slice(0, -1);
                if (event.type === 'reset') tempCode = event.payload;
                newProcessed.add(index);
            }
        });

        setCode(tempCode);
        processedEvents.current = newProcessed;
    };

    const codeLines = code.split('\n');

    return (
        <div className="w-full flex flex-col h-[500px] border border-gray-700 rounded-lg overflow-hidden bg-[#1e1e1e] shadow-xl">
            <div className="flex flex-1 overflow-hidden">
                {/* Line Numbers */}
                <div className="w-12 bg-[#1e1e1e] text-gray-500 text-right pr-2 pt-4 select-none font-mono text-sm border-r border-gray-800">
                    {codeLines.map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>

                {/* Code Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden" dir="ltr">
                    <div className="flex-1 p-4 overflow-auto font-mono text-sm text-[#d4d4d4] leading-relaxed">
                        <pre style={{ margin: 0 }}>
                            {code}
                            {/* Blinking Cursor */}
                            <span className="inline-block w-2.5 h-5 bg-[#007acc] ml-0.5 align-middle animate-pulse"></span>
                        </pre>
                    </div>
                </div>
            </div>

            {/* Player Controls */}
            <div className="h-14 bg-[#252526] border-t border-gray-700 flex items-center px-4 gap-4">
                <button
                    onClick={() => {
                        if (audioRef.current) {
                            if (isPlaying) audioRef.current.pause();
                            else audioRef.current.play();
                            setIsPlaying(!isPlaying);
                        }
                    }}
                    className="text-white hover:text-green-400 transition-colors"
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                    onClick={() => {
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            handleSeek({ currentTarget: audioRef.current } as any);
                            setIsPlaying(false);
                        }
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <RotateCcw size={18} />
                </button>

                {/* Hidden Audio Element but with visible Seek Bar */}
                <audio
                    ref={audioRef}
                    src={script.audioUrl}
                    className="flex-1 h-8 accent-green-500"
                    controls
                    controlsList="nodownload"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onSeeked={handleSeek}
                />
            </div>
        </div>
    );
}
