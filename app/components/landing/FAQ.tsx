'use client';

import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Hoist static data outside component (rendering-hoist-jsx rule)
const faqs = [
    {
        question: "Can I use Verdict.run for free?",
        answer: "Yes, Verdict.run is completely free and open-source for the community. Our mission is to make competitive programming accessible and efficient for everyone."
    },
    {
        question: "Do I need the Chrome Extension?",
        answer: "Yes, the Verdict.run Helper extension is required to bridge your local environment with Codeforces. It handles secure submission and problem parsing without needing your password."
    },
    {
        question: "How does the AI Trainer work?",
        answer: "The AI Trainer uses advanced LLMs to analyze your code and the problem statement legally. It provides hints and logic breakdowns without giving you the full code, helping you learn rather than cheat."
    },
    {
        question: "Is this an official Codeforces product?",
        answer: "No, Verdict.run is an independent community project built by competitive programmers. We use the public Codeforces API and client-side mirroring to improve your workflow."
    },
    {
        question: "Can I run code locally?",
        answer: "Absolutely. Verdict.run is designed for local execution first. You can run unlimited test cases, use custom templates, and stress test your solutions instantly on your own machine."
    }
];

function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // rerender-functional-setstate: use callback for stable reference
    const toggleIndex = useCallback((index: number) => {
        setOpenIndex(prev => prev === index ? null : index);
    }, []);

    return (
        <section className="relative z-10 py-24 bg-[#0a0a0a]">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6 uppercase">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-white/50 text-base md:text-lg tracking-tight max-w-xl mx-auto">
                        Everything you need to know about <span className="text-emerald-400 font-bold">Verdict.run</span>
                    </p>
                </div>

                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border-b border-white/10 last:border-0"
                        >
                            <button
                                onClick={() => toggleIndex(index)}
                                className="w-full py-6 flex items-center justify-between text-left group"
                            >
                                <span className={`text-lg font-bold tracking-tight transition-colors ${openIndex === index ? 'text-emerald-400' : 'text-white group-hover:text-emerald-300'}`}>
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-white/40 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-emerald-400' : 'group-hover:text-emerald-300'}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pb-6 text-white/50 leading-relaxed font-medium tracking-tight">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(FAQ);
