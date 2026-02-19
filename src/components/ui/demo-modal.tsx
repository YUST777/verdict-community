'use client'

import { useEffect } from 'react'
import { X, Play } from 'lucide-react'

interface DemoModalProps {
    isOpen: boolean
    onClose: () => void
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-4xl mx-4">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                    Close <X className="w-4 h-4" />
                </button>

                {/* Video container */}
                <div className="relative aspect-video w-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    {/* Placeholder — replace with <video> or <iframe> when ready */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/40">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Play className="w-7 h-7 text-emerald-400 ml-1" />
                        </div>
                        <p className="text-sm font-medium">Demo video coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
