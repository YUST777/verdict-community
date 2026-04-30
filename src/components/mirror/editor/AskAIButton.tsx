'use client';

import { Wand2 } from 'lucide-react';

interface AskAIButtonProps {
    show: boolean;
    position: { top: number; left: number } | null;
    lineNumbers: { start: number; end: number } | null;
    onAsk: () => void;
    onHover: () => void;
    onLeave: () => void;
}

export default function AskAIButton({
    show,
    position,
    lineNumbers,
    onAsk,
    onHover,
    onLeave
}: AskAIButtonProps) {
    if (!show || !position || !lineNumbers) return null;

    return (
        <button
            onClick={onAsk}
            className="absolute z-50 flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#252526] border border-emerald-500/40 hover:border-emerald-500/60 text-white text-xs font-medium rounded-md transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                position: 'fixed'
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <Wand2 size={12} className="text-emerald-400" strokeWidth={2} />
            <span className="text-white font-medium">Ask AI</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-mono leading-tight">
                <span>@</span>
                <span>
                    {lineNumbers.start === lineNumbers.end
                        ? `line ${lineNumbers.start}`
                        : `lines ${lineNumbers.start}-${lineNumbers.end}`}
                </span>
            </span>
        </button>
    );
}
