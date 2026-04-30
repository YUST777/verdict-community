'use client';

import { motion } from 'framer-motion';
import { Footer } from '@/components/ui/footer-7';

export default function About() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
            <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase mb-6 block">Our Mission</span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 leading-[0.9]">
                        Built for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">speed of thought.</span>
                    </h1>

                    <div className="space-y-8 text-xl text-white/70 leading-relaxed font-light">
                        <p>
                            Verdict started with a simple frustration: Competitive programming tools felt stuck in the past.
                            Clunky interfaces, slow setups, and distracting environments were getting in the way of what matters mostâgetting instant verdicts on your code.
                        </p>

                        <p>
                            We set out to change that. We wanted an environment that felt fast, looked beautiful, and worked seamlessly.
                            No more alt-tabbing. No more waiting for slow judges. Just you, the code, and instant verdicts.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
                                <h3 className="text-2xl font-bold text-white mb-3">Instant Verdicts</h3>
                                <p className="text-white/50 text-base">Get immediate feedback on your code with our lightning-fast judge engine. No more waiting for slow verdicts.</p>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
                                <h3 className="text-2xl font-bold text-white mb-3">Speed Matters</h3>
                                <p className="text-white/50 text-base">From the integrated Monaco editor to instant verdict delivery, everything happens in milliseconds.</p>
                            </div>
                        </div>

                        <p>
                            Today, Verdict is open source and growing. We&apos;re building the new standard for competitive programming with instant verdicts, and we&apos;re just getting started.
                        </p>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
