'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

// Hoist static data outside component (rendering-hoist-jsx rule)
const steps = [
    {
        quarter: 'Jan 18, 2026',
        status: 'Launched',
        title: 'Core Platform',
        description: 'Instant Codeforces mirror, VS Code + Whiteboard workflow, local judge, and analytics. We solved the 15s tab-switching headache.'
    },
    {
        quarter: 'January',
        status: 'Planned',
        title: 'AI Trainer',
        description: 'First AI agent to help you solve competitive problems with voice and live interactive education. Ask it what is better using voice, text, or code.'
    },
    {
        quarter: 'Coming Soon',
        status: 'In Progress',
        title: 'Multiplayer Rooms',
        description: 'Real-time collaborative coding rooms. Send a link to a friend, recruiter, or professor and solve hard problems together on the cloud.'
    }
];

function Roadmap() {
    return (
        <section className="relative z-10 py-16 md:py-32 bg-[#0a0a0a] overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                <div className="mb-12 md:mb-20 text-center">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4 md:mb-6">
                        Product Roadmap
                    </h2>
                    <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed px-2">
                        We are just getting started. Here is our plan to revolutionize competitive programming, step by step.
                    </p>
                </div>

                <div className="relative mt-20">
                    {/* Horizontal Line background */}
                    <div className="absolute top-20 left-0 w-full h-[1px] bg-white/10" />

                    {/* Moving Neon Beam */}
                    <motion.div
                        initial={{ left: "-20%" }}
                        animate={{ left: "100%" }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 0.5
                        }}
                        className="absolute top-20 w-[20%] h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-10 opacity-50 blur-[1px]"
                    />

                    {/* Horizontal scroll on mobile, grid on desktop */}
                    <div className="flex md:grid md:grid-cols-3 gap-8 md:gap-4 relative text-center overflow-x-auto pt-8 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center group flex-shrink-0 w-[280px] md:w-auto snap-center">

                                {/* Date Pill (Above Line) */}
                                <div className="mb-8 relative z-20">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${index < 2 ? 'bg-white text-black border-white' : 'bg-[#111] text-white/40 border-white/10'}`}>
                                        {step.quarter}
                                    </span>
                                </div>

                                {/* Dot on Line */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full border-4 z-10 transition-colors duration-500 ${index < 2 ? 'border-white bg-black' : 'border-[#222] bg-black'}`} />
                                    {/* rendering-conditional-render: use ternary, not && */}
                                    {index === 1 ? (
                                        <div className="absolute inset-0 bg-white/30 blur-md rounded-full animate-pulse" />
                                    ) : null}
                                </div>

                                {/* Content (Below Line) */}
                                <div className="mt-12 md:px-4">
                                    <h3 className={`text-lg font-bold mb-2 ${index < 2 ? 'text-white' : 'text-white/40'}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed max-w-[200px] mx-auto ${index < 2 ? 'text-white/60' : 'text-white/20'}`}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        </section>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(Roadmap);
