'use client';

import { Download, AlertTriangle, Puzzle } from 'lucide-react';
import Link from 'next/link';
import { Navbar, Footer } from '../components/landing';

export default function ExtensionPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-4xl w-full text-center space-y-8">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-sm font-medium">
                            <Puzzle size={16} />
                            <span>Browser Extension</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-white to-[#888] bg-clip-text text-transparent">
                            Verdict Helper
                        </h1>
                        <p className="text-xl text-[#888] max-w-2xl mx-auto">
                            The bridge between Verdict and Codeforces. Submit solutions directly from your browser.
                        </p>
                    </div>

                    {/* Demo Video */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#121212]">
                        <iframe
                            src="https://www.youtube.com/embed/1_Q3agYkioE"
                            title="Verdict Extension Demo"
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Download Section */}
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 sm:p-12 relative overflow-hidden group">
                        {/* Status Banner */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 text-left flex items-start gap-4">
                            <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-yellow-500">Pending Chrome Web Store Review</h3>
                                <p className="text-[#888] text-sm mt-1">
                                    Google is currently reviewing our extension. In the meantime, you can install it manually in developer mode. It&apos;s safe, open-source, and takes less than a minute!
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a
                                href="/verdict-helper.zip"
                                download
                                className="flex items-center gap-3 px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#10B981]/20 group-hover:shadow-[#10B981]/40"
                            >
                                <Download size={24} />
                                Download Zip
                            </a>
                            <Link
                                href="https://github.com/YUST777/verdict-community/tree/master/extension"
                                target="_blank"
                                className="flex items-center gap-2 text-[#888] hover:text-white transition-colors underline-offset-4 hover:underline"
                            >
                                View Source Code
                            </Link>
                        </div>
                    </div>

                    {/* Installation Guide */}
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-2xl font-bold text-white mb-2">
                                <span className="w-8 h-8 rounded-full bg-[#10B981] text-black flex items-center justify-center text-sm font-bold">1</span>
                                Unzip
                            </div>
                            <p className="text-[#888]">
                                Download the zip file and extract it to a folder on your computer. You should see files like <span className="text-[#10B981] font-mono bg-[#10B981]/10 px-1 rounded">manifest.json</span> inside.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-2xl font-bold text-white mb-2">
                                <span className="w-8 h-8 rounded-full bg-[#10B981] text-black flex items-center justify-center text-sm font-bold">2</span>
                                Open Extensions
                            </div>
                            <p className="text-[#888]">
                                Open Chrome and go to <span className="text-white font-mono bg-white/10 px-1 rounded">chrome://extensions</span>.<br />
                                Enable <b>Developer mode</b> in the top right corner.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-2xl font-bold text-white mb-2">
                                <span className="w-8 h-8 rounded-full bg-[#10B981] text-black flex items-center justify-center text-sm font-bold">3</span>
                                Load Unpacked
                            </div>
                            <p className="text-[#888]">
                                Click <b>Load unpacked</b> and select the folder you just extracted. That&apos;s it!
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
