'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Send } from 'lucide-react';

function Footer() {
    return (
        <footer className="relative z-10 border-t border-white/5 bg-black py-8 md:py-12 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6">

                {/* Mobile Layout - Compact */}
                <div className="md:hidden">
                    {/* Brand + Socials */}
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/icons/logo.webp"
                                alt="Verdict Logo"
                                width={28}
                                height={28}
                                className="w-7 h-7 object-contain"
                            />
                            <span className="text-lg font-bold tracking-tight text-white">Verdict.run</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="https://github.com/YUST777/verdict-community" target="_blank" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                                <Github className="w-4 h-4" />
                            </Link>
                            <Link href="https://x.com/VerdictRun" target="_blank" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="https://t.me/verdict_run_chat" target="_blank" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                                <Send className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Links - Compact 3-column grid */}
                    <div className="grid grid-cols-3 gap-4 text-xs mb-6">
                        <div className="space-y-2">
                            <h4 className="text-white font-semibold">Product</h4>
                            <Link href="#features" className="block text-white/40">Features</Link>
                            <Link href="/extension" className="block text-white/40">Extension</Link>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-semibold">Company</h4>
                            <Link href="/about" className="block text-white/40">About</Link>
                            <Link href="/blog" className="block text-white/40">Blog</Link>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-semibold">Resources</h4>
                            <Link href="/community" className="block text-white/40">Community</Link>
                            <Link href="/help" className="block text-white/40">Help</Link>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="flex items-center justify-between text-[10px] text-white/30 pt-4 border-t border-white/5">
                        <span>© 2026 Verdict.run</span>

                    </div>
                </div>

                {/* Desktop Layout - Full */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-10 gap-8 mb-12">
                        {/* Brand Column */}
                        <div className="col-span-4 flex flex-col gap-6">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src="/icons/logo.webp"
                                    alt="Verdict Logo"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="text-xl font-bold tracking-tight text-white">Verdict.run</span>
                            </Link>
                            <p className="text-white/50 text-base leading-relaxed max-w-sm">
                                The modern standard for competitive programming. Mirror problems, code instantly, and solve without limits.
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <Link href="https://github.com/YUST777/verdict-community" target="_blank" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                                    <Github className="w-5 h-5" />
                                </Link>
                                <Link href="https://x.com/VerdictRun" target="_blank" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                                    <Twitter className="w-5 h-5" />
                                </Link>
                                <Link href="https://t.me/verdict_run_chat" target="_blank" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                                    <Send className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="col-span-2 col-start-5 flex flex-col gap-4">
                            <h4 className="text-white font-semibold mb-2">Product</h4>
                            <Link href="#features" className="text-white/50 hover:text-white transition-colors text-sm">Features</Link>
                            <Link href="/extension" className="text-white/50 hover:text-white transition-colors text-sm">Extension</Link>
                            <Link href="#changelog" className="text-white/50 hover:text-white transition-colors text-sm">Changelog</Link>
                        </div>

                        <div className="col-span-2 flex flex-col gap-4">
                            <h4 className="text-white font-semibold mb-2">Company</h4>
                            <Link href="/about" className="text-white/50 hover:text-white transition-colors text-sm">About</Link>
                            <Link href="/blog" className="text-white/50 hover:text-white transition-colors text-sm">Blog</Link>
                        </div>

                        <div className="col-span-2 flex flex-col gap-4">
                            <h4 className="text-white font-semibold mb-2">Resources</h4>
                            <Link href="/community" className="text-white/50 hover:text-white transition-colors text-sm">Community</Link>
                            <Link href="/help" className="text-white/50 hover:text-white transition-colors text-sm">Help Center</Link>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <p className="text-sm text-white/30">
                            © 2026 Verdict.run Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-white/30">

                        </div>
                    </div>
                </div>
            </div>

            {/* Giant Background Text Effect */}
            <div className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 pointer-events-none select-none opacity-[0.03]">
                <div className="text-[25rem] font-black leading-none tracking-tighter text-white whitespace-nowrap">
                    VERDICT
                </div>
            </div>
        </footer>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(Footer);
