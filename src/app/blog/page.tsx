'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/ui/footer-7';

const blogPosts = [
    {
        id: 1,
        title: 'How to Get Instant Verdicts on Your Competitive Programming Code',
        slug: 'instant-verdicts-competitive-programming',
        excerpt: 'Learn how Verdict delivers instant feedback on your code submissions, helping you practice competitive programming faster than ever before.',
        date: 'March 6, 2026',
        readTime: '5 min read',
        category: 'Tutorial',
        keywords: ['instant verdict', 'competitive programming', 'code feedback'],
    },
    {
        id: 2,
        title: 'Verdict vs Codeforces: Why Instant Verdicts Matter',
        slug: 'verdict-vs-codeforces',
        excerpt: 'Discover why getting instant verdicts on your code can dramatically improve your competitive programming practice and contest performance.',
        date: 'March 5, 2026',
        readTime: '7 min read',
        category: 'Comparison',
        keywords: ['verdict', 'codeforces', 'instant verdict'],
    },
    {
        id: 3,
        title: '5 Ways Verdict Speeds Up Your ICPC Training',
        slug: 'verdict-icpc-training',
        excerpt: 'From instant verdicts to AI-powered hints, learn how Verdict helps ICPC teams train more efficiently and solve problems faster.',
        date: 'March 4, 2026',
        readTime: '6 min read',
        category: 'Training',
        keywords: ['ICPC', 'verdict', 'competitive programming training'],
    },
];

export default function Blog() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                        Verdict Blog
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Learn about competitive programming, instant verdicts, algorithm strategies, and platform updates.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <article
                            key={post.id}
                            className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all hover:bg-white/[0.07]"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {post.category}
                                </span>
                                <span className="text-xs text-white/40">{post.readTime}</span>
                            </div>

                            <h2 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">
                                {post.title}
                            </h2>

                            <p className="text-white/60 mb-4 leading-relaxed">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-sm text-white/40">
                                    <Calendar size={14} />
                                    <span>{post.date}</span>
                                </div>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    Read More
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {post.keywords.map((keyword, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs px-2 py-1 rounded bg-white/5 text-white/40"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-white/40 mb-4">More articles coming soon!</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:scale-105"
                    >
                        Back to Home
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
