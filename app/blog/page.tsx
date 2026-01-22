'use client';

import { Navbar, Footer } from '../components/landing';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const posts = [
    {
        id: 1,
        title: "Introducing Verdict: The Future of CP",
        excerpt: "We are excited to announce the public beta of Verdict. Learn how we are redefining the competitive programming workflow.",
        date: "January 15, 2026",
        category: "Announcement",
        readTime: "3 min read"
    },
    {
        id: 2,
        title: "Under the Hood: The Mirror Engine",
        excerpt: "A technical deep dive into how we instantly mirror Codeforces problems and run local tests with zero latency.",
        date: "January 10, 2026",
        category: "Engineering",
        readTime: "8 min read"
    },
    {
        id: 3,
        title: "Release Notes: v1.0.4",
        excerpt: "New whiteboard features, faster submissions, and a complete UI overhaul. Check out what's new in the latest update.",
        date: "January 02, 2026",
        category: "Updates",
        readTime: "2 min read"
    }
];

export default function Blog() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
            <Navbar />

            <main className="pt-40 pb-20 px-6 max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <span className="text-emerald-400 font-mono text-sm tracking-wider uppercase mb-6 block">Blog</span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        Latest from <br /> the team.
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl">
                        Updates, tutorials, and engineering deep dives from the creators of Verdict.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className="group flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all hover:-translate-y-1"
                        >
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 mb-6 text-xs font-mono text-emerald-400">
                                    <span>{post.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="text-white/40">{post.readTime}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-400 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-white/50 leading-relaxed mb-8 flex-grow">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                    <span className="text-sm text-white/30">{post.date}</span>
                                    <span className="text-emerald-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <ArrowRight size={18} />
                                    </span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
