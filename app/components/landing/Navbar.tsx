'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, User, X, ArrowUpRight, Github
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function Navbar() {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, loading } = useAuth();
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/YUST777/verdict-community')
            .then(res => res.json())
            .then(data => setStars(data.stargazers_count))
            .catch(err => console.error('Error fetching stars:', err));
    }, []);

    const iconProps = {
        size: 20,
        strokeWidth: 1.5,
        className: "transition-all duration-300"
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] w-full px-4 pt-4 md:px-6 md:pt-6 font-sans antialiased">
            <div className="mx-auto max-w-7xl">
                <div className={`relative backdrop-blur-3xl bg-black/40 border border-white/10 rounded-[24px] shadow-2xl transition-all duration-500 ${open ? 'rounded-b-none' : ''}`}>
                    <div className="flex items-center justify-between px-5 py-3 md:px-8 md:py-4">

                        {/* Logo Section */}
                        <Link href="/" className="flex items-center gap-2 shrink-0 group cursor-pointer">
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <Image
                                    src="/icons/logo.webp"
                                    alt="Verdict Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex items-center h-10">
                                <span className="text-white/60 text-sm font-medium">
                                    v1.0.1
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                {/* GitHub Stars */}
                                <Link
                                    href="https://github.com/YUST777/verdict-community"
                                    target="_blank"
                                    onClick={() => {
                                        const audio = new Audio('/images/star.mp3');
                                        audio.volume = 0.5;
                                        audio.play().catch(() => { });
                                    }}
                                    className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                                >
                                    <Github {...iconProps} className="group-hover:text-white transition-colors" />
                                    <span className="text-sm font-bold tracking-wide text-white">{stars !== null ? stars : '0'}</span>
                                    <Image
                                        src="/images/star.webp"
                                        alt="Star"
                                        width={20}
                                        height={20}
                                        className="object-contain group-hover:scale-110 transition-transform ml-1"
                                    />
                                </Link>

                                <div className="w-px h-8 bg-white/10 mx-3" />

                                {loading ? (
                                    <div className="bg-white/10 animate-pulse px-8 py-3 rounded-2xl w-[120px] h-[48px]" />
                                ) : isAuthenticated ? (
                                    <Link href="/dashboard" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                                        <User {...iconProps} size={18} strokeWidth={2} />
                                        <span>Account</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                                    >
                                        <span>Sign In</span>
                                        <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setOpen(!open)}
                                className={`p-3 rounded-2xl transition-all duration-300 ${open ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={open ? 'close' : 'open'}
                                        initial={{ opacity: 0, rotate: -45 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 45 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {open ? <X size={24} /> : <Menu size={24} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu (Animated Dropdown) */}
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="md:hidden border-t border-white/5 overflow-hidden bg-black/40 backdrop-blur-xl"
                            >
                                <div className="px-5 py-8 space-y-4">
                                    <Link
                                        href="https://github.com/YUST777/verdict-community"
                                        target="_blank"
                                        onClick={() => {
                                            const audio = new Audio('/images/star.mp3');
                                            audio.volume = 0.5;
                                            audio.play().catch(() => { });
                                        }}
                                        className="flex items-center justify-center gap-2 p-6 rounded-[24px] bg-white/5 border border-white/5 text-emerald-400 active:bg-emerald-500/10 active:border-emerald-500/30 transition-all"
                                    >
                                        <Github size={24} className="text-white" />
                                        <span className="font-bold text-xs uppercase tracking-widest text-white">Star on GitHub ({stars || 0})</span>
                                        <Image
                                            src="/images/star.webp"
                                            alt="Star"
                                            width={24}
                                            height={24}
                                            className="object-contain ml-1"
                                        />
                                    </Link>

                                    {loading ? (
                                        <div className="w-full h-[68px] bg-white/10 animate-pulse rounded-[24px]" />
                                    ) : isAuthenticated ? (
                                        <Link
                                            href="/dashboard"
                                            className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-white p-5 rounded-[24px] font-black uppercase tracking-tighter text-lg"
                                        >
                                            <User size={20} strokeWidth={2.5} />
                                            Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-white p-5 rounded-[24px] font-black uppercase tracking-tighter text-lg"
                                        >
                                            <User size={20} strokeWidth={2.5} />
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(Navbar);
