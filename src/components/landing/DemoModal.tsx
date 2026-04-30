'use client';

import { memo } from 'react';
import { Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function DemoModal({ isOpen, onClose }: DemoModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            // Remove the inline style if it's empty to be clean
            if (document.body.getAttribute('style') === '') {
                document.body.removeAttribute('style');
            }
        }
        return () => {
            document.body.style.overflow = '';
            if (document.body.getAttribute('style') === '') {
                document.body.removeAttribute('style');
            }
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ring-1 ring-white/5 z-10">

                {/* Header */}
                <div className="p-6 pb-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center pl-0.5">
                            <Play size={10} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Welcome to Verdict.run</h3>
                                <p className="text-white/50 text-sm mb-3">Quick guide to the ultimate competitive programming workflow.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/30 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-white/50 font-medium">
                            2 min
                        </span>
                    </div>
                </div>

                {/* Video Player */}
                <div className="bg-black aspect-video relative">
                    <iframe
                        src="https://www.youtube.com/embed/1_Q3agYkioE?autoplay=1"
                        title="Verdict.run Demo"
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                {/* Footer */}
                <div className="p-4 flex justify-end bg-[#0a0a0a] border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-full transition-all hover:scale-105"
                    >
                        I understand
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(DemoModal);
