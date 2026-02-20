'use client';

import { useState, memo, useCallback } from 'react';
import { Plus, X, Zap, Globe, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hoist static data outside component (rendering-hoist-jsx rule)
const features = [
    {
        id: 'workspace',
        title: 'VS Code + Whiteboard',
        description: 'Unified workflow. Sketch your logic on the built-in whiteboard and code in a full Monaco (VS Code) editor side-by-side. Stop wasting time switching tabs.',
        icon: Code2
    },
    {
        id: 'judge',
        title: 'Instant Pre-Test',
        description: 'Don\'t wait for the slow Codeforces queue. Run test cases locally with our custom judge to validate your logic in milliseconds before you ship it.',
        icon: Zap
    },
    {
        id: 'analytics',
        title: 'Analytics & History',
        description: 'Track your solving speed and view full submission history. Our extension bridges the gap to bring you safe, fast verdicts without the clutter.',
        icon: Globe
    }
];

function PoweredBy() {
    const [activeFeature, setActiveFeature] = useState<string | null>('workspace');

    // rerender-functional-setstate: use useCallback for stable reference
    const toggleFeature = useCallback((featureId: string) => {
        setActiveFeature(prev => prev === featureId ? null : featureId);
    }, []);

    return (
        <section className="relative z-10 py-16 md:py-32 bg-[#0a0a0a] overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-start">

                    {/* Left Content */}
                    <div>
                        <div className="mb-8 md:mb-12 text-left">
                            <motion.h3
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: true, amount: 0.5 }}
                                className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4 md:mb-6 leading-tight"
                            >
                                The Ultimate<br />Workflow
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-base md:text-lg text-white/50 leading-relaxed"
                            >
                                Eliminate friction and focus on the algorithm. Verdict.run combines instant mirroring, a powerful cloud IDE, and seamless syncing into a single, reliable platform for competitive programmers.
                            </motion.p>
                        </div>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                                    viewport={{ once: true }}
                                    className={`group border-b border-white/5 pb-4 cursor-pointer transition-all duration-300 ${activeFeature === feature.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                                    onClick={() => toggleFeature(feature.id)}
                                >
                                    <div className="flex items-center justify-between py-2">
                                        <h4 className="text-xl font-bold text-white tracking-tight">{feature.title}</h4>
                                        <button className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${activeFeature === feature.id ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent text-white/50 border-white/20'}`}>
                                            {activeFeature === feature.id ? <X size={14} /> : <Plus size={14} />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {activeFeature === feature.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-white/60 text-base leading-relaxed max-w-md pb-2">
                                                    {feature.description}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Visual (Abstract Grid & Floating Elements) */}
                    <div className="relative h-[600px] w-full hidden lg:block">
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

                        {/* Floating Cards Container */}
                        <div className="relative w-full h-full flex items-center justify-center">

                            {/* Card 1: Main Metric */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-2xl z-20"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono text-white/40">+</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-5xl font-mono font-bold text-white tracking-tighter">
                                        {activeFeature === 'workspace' ? '-15s' : activeFeature === 'judge' ? '<10ms' : 'Live'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-mono text-white/40">
                                        {activeFeature === 'workspace' ? 'Time' : activeFeature === 'judge' ? 'Lat' : 'Stat'}
                                    </span>
                                    <span className="text-xs font-mono text-white/40">-</span>
                                </div>
                            </motion.div>

                            {/* Card 2: Secondary Element (Top Right) */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[20%] right-[10%] w-40 h-40 bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-2xl p-4 backdrop-blur-md z-10"
                            >
                                <div className="flex gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="w-3/4 h-2 bg-white/10 rounded-full" />
                                    <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                                </div>
                            </motion.div>

                            {/* Card 3: Circle Element (Bottom Right) */}
                            <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full border border-white/5 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
                                </div>
                            </div>

                            {/* Glowing Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-[1px]" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(PoweredBy);
