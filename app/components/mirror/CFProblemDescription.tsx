'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { CFProblemData } from './types';
import { Clock, HardDrive } from 'lucide-react';

// React.memo prevents re-renders when parent state (resize) changes but data is same.
// This is critical because re-render recreates dangerouslySetInnerHTML object, 
// forcing React to reset the DOM and wiping out MathJax.
export const CFProblemDescription = React.memo(function CFProblemDescription({ data }: { data: CFProblemData | null }) {
    // Trigger MathJax typeset whenever re-render occurs (which means data changed due to memo)
    useEffect(() => {
        const w = window as Window & { MathJax?: { typesetPromise?: () => Promise<void> } };
        if (data && typeof window !== 'undefined' && w.MathJax?.typesetPromise) {
            w.MathJax.typesetPromise();
        }
    }); // No dependency array: run on every commit (mount + update)

    if (!data) return null;

    return (
        <div className="prose prose-invert max-w-none text-white/90 selection:bg-[#10B981]/30">
            {/* Load MathJax from CDN */}
            <Script
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // Initial typeset when script loads
                    const w = window as Window & { MathJax?: { typesetPromise?: () => Promise<void> } };
                    if (data && w.MathJax?.typesetPromise) {
                        w.MathJax.typesetPromise();
                    }
                }}
            />

            <style jsx global>{`
                .prose img { display: inline-block; margin: 0 auto; max-width: 100%; border-radius: 8px; }
                .prose .tex-font-style-tt { font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.1em 0.3em; run: 4px; }
                .prose .tex-formula { color: #10B981; }
                .prose ul { list-style-type: disc; padding-left: 1.5em; }
                .prose ol { list-style-type: decimal; padding-left: 1.5em; }
                .prose pre { background: #1a1a1a; padding: 1em; border-radius: 8px; overflow-x: auto; }
                
                /* MathJax specific overrides for dark mode visibility */
                mjx-container { color: #E0E0E0 !important; }
            `}</style>

            <h1 className="text-3xl font-bold mb-2 text-white">{data.meta.title}</h1>
            <div className="flex gap-4 text-sm text-white/50 mb-8 border-b border-white/10 pb-4">
                <span className="flex items-center gap-2"><Clock size={16} className="text-[#10B981]" /> {data.meta.timeLimitMs} ms</span>
                <span className="flex items-center gap-2"><HardDrive size={16} className="text-[#10B981]" /> {data.meta.memoryLimitMB} MB</span>
            </div>

            <div dangerouslySetInnerHTML={{ __html: data.story }} className="mb-8 leading-relaxed" />

            {data.inputSpec && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-3 text-[#10B981]">Input</h3>
                    <div dangerouslySetInnerHTML={{ __html: data.inputSpec }} />
                </div>
            )}
            {data.outputSpec && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-3 text-[#10B981]">Output</h3>
                    <div dangerouslySetInnerHTML={{ __html: data.outputSpec }} />
                </div>
            )}

            <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-[#10B981]">Examples</h3>
                {data.testCases.map((tc, idx) => (
                    <div key={idx} className="border border-white/10 rounded-lg overflow-hidden bg-[#1a1a1a]">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                            <div className="p-0">
                                <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-bold text-white/60 uppercase tracking-wider">Input</div>
                                <pre className="p-4 bg-transparent m-0 font-mono text-sm leading-relaxed whitespace-pre-wrap">{tc.input}</pre>
                            </div>
                            <div className="p-0">
                                <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-bold text-white/60 uppercase tracking-wider">Output</div>
                                <pre className="p-4 bg-transparent m-0 font-mono text-sm leading-relaxed whitespace-pre-wrap">{tc.output}</pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.note && (
                <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-lg font-bold mb-3 text-white/80">Note</h3>
                    <div dangerouslySetInnerHTML={{ __html: data.note }} className="text-white/70 italic" />
                </div>
            )}
        </div>
    );
});
