'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Footer } from '@/components/ui/footer-7';

export default function BlogPost() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <article className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Blog
                </Link>

                <div className="mb-8">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Tutorial
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                    How to Get Instant Verdicts on Your Competitive Programming Code
                </h1>

                <div className="flex items-center gap-6 text-sm text-white/40 mb-12 pb-8 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>March 6, 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>5 min read</span>
                    </div>
                </div>

                <div className="prose prose-invert prose-emerald max-w-none">
                    <p className="text-xl text-white/70 leading-relaxed mb-8">
                        In competitive programming, speed matters. Every second you wait for a verdict is a second you could be solving the next problem. That's why Verdict was builtâto give you instant feedback on your code.
                    </p>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">What Are Instant Verdicts?</h2>
                    <p className="text-white/70 leading-relaxed mb-6">
                        An instant verdict is immediate feedback on whether your code passes all test cases. Instead of waiting 5-10 seconds (or longer) for traditional online judges, Verdict delivers results in under 1 second using our optimized Judge0 engine.
                    </p>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">Why Instant Verdicts Matter</h2>
                    <ul className="space-y-4 text-white/70 mb-8">
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">â¢</span>
                            <span><strong className="text-white">Faster Iteration:</strong> Test multiple approaches quickly without waiting for slow verdicts</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">â¢</span>
                            <span><strong className="text-white">Better Focus:</strong> Stay in flow state without context-switching delays</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">â¢</span>
                            <span><strong className="text-white">More Practice:</strong> Solve 2-3x more problems in the same time</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-emerald-400 font-bold">â¢</span>
                            <span><strong className="text-white">Contest Advantage:</strong> Debug faster during live competitions</span>
                        </li>
                    </ul>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">How Verdict Delivers Instant Verdicts</h2>
                    <p className="text-white/70 leading-relaxed mb-6">
                        Verdict uses a local Judge0 instance with optimized compilation and execution. Here's how it works:
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                        <ol className="space-y-4 text-white/70">
                            <li><strong className="text-white">1. Write your code</strong> in our Monaco editor with syntax highlighting</li>
                            <li><strong className="text-white">2. Click "Run"</strong> to execute against sample test cases</li>
                            <li><strong className="text-white">3. Get instant verdict</strong> in under 1 second with detailed output</li>
                            <li><strong className="text-white">4. Iterate quickly</strong> based on immediate feedback</li>
                        </ol>
                    </div>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">Getting Started with Verdict</h2>
                    <p className="text-white/70 leading-relaxed mb-6">
                        Ready to experience instant verdicts? Here's how to start:
                    </p>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8">
                        <ol className="space-y-3 text-white/70">
                            <li>1. Visit <a href="https://verdict.run" className="text-emerald-400 hover:underline">verdict.run</a></li>
                            <li>2. Paste any Codeforces problem URL</li>
                            <li>3. Start coding and get instant verdicts on every run</li>
                        </ol>
                    </div>

                    <h2 className="text-3xl font-bold text-white mt-12 mb-6">Conclusion</h2>
                    <p className="text-white/70 leading-relaxed mb-6">
                        Instant verdicts aren't just a convenienceâthey're a game-changer for competitive programming practice. By eliminating wait times, Verdict helps you practice more efficiently, debug faster, and ultimately become a better programmer.
                    </p>

                    <p className="text-white/70 leading-relaxed">
                        Try Verdict today and experience the difference instant verdicts make in your competitive programming journey.
                    </p>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:scale-105"
                    >
                        Try Verdict Now
                    </Link>
                </div>
            </article>

            <Footer />
        </div>
    );
}
