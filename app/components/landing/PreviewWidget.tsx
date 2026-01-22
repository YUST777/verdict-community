'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { ArrowRight, Signal, Battery, ChevronLeft, ChevronRight, Clock, HardDrive, FileText, Code2, Check, Lightbulb, Trophy } from 'lucide-react';
import Image from 'next/image';
import Tooltip from './Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

type SubmissionState = 'idle' | 'submitting' | 'judging' | 'accepted';
type TestState = 'idle' | 'compiling' | 'running' | 'error' | 'success';

function PreviewWidget() {
    const [activeTab, setActiveTab] = useState('description');
    const [activeMobileTab, setActiveMobileTab] = useState('problem'); // Mobile Tabs
    const [showExtension, setShowExtension] = useState(false);
    const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
    const [browserTab, setBrowserTab] = useState('problem'); // 'problem' | 'submit' | 'result'
    const [testState, setTestState] = useState<TestState>('idle');
    const [testError, setTestError] = useState<string | null>(null);

    const handleRunTests = async () => {
        setTestState('compiling');
        setTestError(null);

        // Simulate compilation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Show compilation error (since template code doesn't solve the problem)
        setTestState('error');
        setTestError('Compilation Error: Your code produces no output. The main() function returns 0 without printing anything.');
    };

    const handleSubmit = async () => {
        setSubmissionState('submitting');
        setBrowserTab('submit');
        setTestState('idle');
        setTestError(null);

        // Simulate submission process
        await new Promise(resolve => setTimeout(resolve, 1000));

        setBrowserTab('result');
        setSubmissionState('judging');

        // Simulate judging
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmissionState('accepted');
    };

    const resetSubmission = () => {
        setSubmissionState('idle');
        setBrowserTab('problem');
        setTestState('idle');
        setTestError(null);
    };

    const getBrowserTabTitle = () => {
        switch (browserTab) {
            case 'submit':
                return 'Submitting...';
            case 'result':
                return submissionState === 'accepted' ? '✓ Accepted' : 'Judging...';
            default:
                return 'A. Kill Two Birds with One Stone';
        }
    };

    return (
        <section className="relative z-10 py-12 md:py-20 px-4 md:px-6 md:-mt-32">
            {/* Background Glow - Intensified */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                {/* Section Header - Only shown on desktop where the preview widget is visible */}
                <div className="hidden md:block text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 relative z-10">
                        Experience the <span className="text-emerald-400">Interface</span>
                    </h2>
                    <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base px-4 relative z-10">
                        A beautiful, distraction-free coding environment with everything you need
                    </p>
                </div>

                {/* Mini Preview Widget - Hidden on mobile, shown on desktop */}
                <div className="hidden md:block relative rounded-2xl overflow-hidden border border-white/20 bg-[#0d0d0d] shadow-2xl shadow-emerald-900/20 backdrop-blur-sm">
                    {/* Browser Chrome */}
                    <div className="bg-[#1a1a1a] border-b border-white/5">
                        {/* Window Controls + Tabs Row */}
                        <div className="flex items-end gap-3 px-4 pt-6 pb-0">
                            <Tooltip content="Window Controls" position="bottom">
                                <div className="flex gap-1.5 mb-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                            </Tooltip>
                            {/* Browser Tab */}
                            <Tooltip content="Active Verdict Tab" position="bottom">
                                <div className={`flex items-center gap-2 px-4 py-1.5 bg-[#0d0d0d] rounded-t-lg border-t border-x border-white/10 transition-colors ${browserTab !== 'problem' ? 'border-emerald-500/30' : ''}`}>
                                    <div className="w-4 h-4 relative">
                                        {submissionState === 'submitting' || submissionState === 'judging' ? (
                                            <div className="absolute inset-0 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Image src="/icons/logo.webp" alt="Logo" fill className="object-contain" />
                                        )}
                                    </div>
                                    <span className={`text-xs transition-colors ${submissionState === 'accepted' ? 'text-emerald-400' : 'text-white/70'}`}>
                                        {getBrowserTabTitle()}
                                    </span>
                                    <button className="text-white/30 hover:text-white/60 ml-2">×</button>
                                </div>
                            </Tooltip>

                            {/* Second tab (Codeforces) - appears during submission */}
                            {browserTab !== 'problem' && (
                                <Tooltip content="Extension Auto-Opens CF" position="bottom">
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-t-lg text-xs text-white/40">
                                        <div className="w-4 h-4 rounded bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-blue-400 text-[8px] font-bold">CF</span>
                                        </div>
                                        <span>Codeforces - Submit</span>
                                    </div>
                                </Tooltip>
                            )}
                        </div>

                        {/* Address Bar Row */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#0d0d0d]">
                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-1">
                                <button className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button onClick={resetSubmission} className="p-1.5 text-white/30 hover:text-white/60 hover:bg-white/5 rounded transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>

                            {/* URL Bar */}
                            <Tooltip content="Secure Mirror URL" position="bottom">
                                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-[#161616] rounded-full border border-white/10">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div className="flex items-center gap-1 text-sm">
                                        <span className="text-emerald-400 font-medium">verdict.run</span>
                                        <span className="text-white/40">/gym/106259/problem/A</span>
                                    </div>
                                    <div className="ml-4 flex items-center gap-2 text-xs text-white/30">
                                        <span className="line-through">codeforces.com/gym/106259/problem/A</span>
                                        <span className="text-emerald-400">→</span>
                                    </div>
                                </div>
                            </Tooltip>

                            {/* Extension Icon */}
                            <div className="relative">
                                <Tooltip content="Verdict.run Extension" position="left">
                                    <button
                                        onClick={() => setShowExtension(!showExtension)}
                                        className={`p-1.5 rounded transition-colors ${showExtension ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-400/60 hover:text-emerald-400 hover:bg-white/5'}`}
                                    >
                                        <div className="w-5 h-5 relative">
                                            <Image src="/icons/logo.webp" alt="Logo" fill className="object-contain" />
                                        </div>
                                    </button>
                                </Tooltip>

                                {/* Mini Extension Popup */}
                                <AnimatePresence>
                                    {showExtension && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute top-full right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
                                        >
                                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                                <div className="w-10 h-10 relative">
                                                    <Image src="/icons/logo.webp" alt="Logo" fill className="object-contain" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">Verdict.run Helper</div>
                                                    <div className="text-[11px] text-white/50">Codeforces Submission Bridge</div>
                                                </div>
                                            </div>

                                            <div className="m-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[13px] text-white/60">Extension Status</span>
                                                    <span className="flex items-center gap-1.5 text-[13px] font-medium">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                                                        Active
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[13px] text-white/60">Codeforces Login</span>
                                                    <span className="flex items-center gap-1.5 text-[13px] font-medium">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                                                        Logged In
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="px-4 space-y-2">
                                                <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                                                    Refresh Status
                                                </button>
                                                <button className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-[13px] font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2">
                                                    Open Codeforces
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                </button>
                                            </div>

                                            <div className="mt-4 py-3 text-center flex items-center justify-center gap-1">
                                                <span className="text-[11px] text-white/40">Verdict.run Helper by</span>
                                                <span className="text-[11px] text-emerald-400 font-medium">Verdict.run</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* App Header Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold text-sm">A.</span>
                            <span className="text-white/80 text-sm font-medium">Kill Two Birds with One Stone</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                            <Tooltip content="Time Limit" position="top">
                                <span><Clock className="w-2.5 h-2.5 inline mr-1" /> 1s</span>
                            </Tooltip>
                            <Tooltip content="Memory Limit" position="top">
                                <span><HardDrive className="w-2.5 h-2.5 inline mr-1" /> 256MB</span>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[600px]">
                        {/* Left Panel - Problem Description */}
                        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col">
                            {/* Tabs */}
                            <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-[#0f0f0f]">
                                <Tooltip content="Problem Statement" position="bottom">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'description' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        Description
                                    </button>
                                </Tooltip>
                                <Tooltip content="Your Past Attempts" position="bottom">
                                    <button
                                        onClick={() => setActiveTab('submissions')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'submissions' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        Submissions
                                    </button>
                                </Tooltip>
                                <Tooltip content="Performance Stats" position="bottom">
                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        Analytics
                                    </button>
                                </Tooltip>
                                <Tooltip content="Editorial & Hints" position="bottom">
                                    <button
                                        onClick={() => setActiveTab('solution')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'solution' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        Solution
                                    </button>
                                </Tooltip>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 p-6 overflow-auto">
                                {activeTab === 'description' && (
                                    <>
                                        <h3 className="text-sm font-bold text-white mb-3">Problem Statement</h3>
                                        <div className="space-y-3 text-xs text-white/60 leading-relaxed">
                                            <p>
                                                Why are lots of things in twos? Hands on clocks, and gloves, and shoes,
                                                Scissor-blades, and water taps, Collar studs, and luggage straps...
                                            </p>
                                            <p>
                                                You are given a binary matrix M of size <span className="text-emerald-400 font-mono">n × m</span>,
                                                where rows are numbered from 1 to n from top to bottom and columns are
                                                numbered from 1 to m from left to right.
                                            </p>
                                            <p>
                                                Your task is to determine whether it is possible to transform the matrix into
                                                a null matrix (i.e., a matrix where all entries are 0).
                                            </p>
                                        </div>
                                        <div className="mt-6 grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-xs font-bold text-white mb-2">INPUT</h4>
                                                <div className="text-[10px] text-white/50 leading-relaxed">
                                                    The first line contains t (1 ≤ t ≤ 10⁴) — the number of test cases.
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white mb-2">OUTPUT</h4>
                                                <div className="text-[10px] text-white/50 leading-relaxed">
                                                    For each test case, output YES if possible, NO otherwise.
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'submissions' && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-white mb-4">Recent Submissions</h3>
                                        {[
                                            { id: '234567890', verdict: 'Accepted', time: '46ms', memory: '3.9MB', lang: 'C++17' },
                                            { id: '234567889', verdict: 'Wrong Answer', time: '31ms', memory: '3.8MB', lang: 'C++17' },
                                            { id: '234567888', verdict: 'Time Limit', time: '1000ms', memory: '4.1MB', lang: 'Python 3' },
                                        ].map((sub, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-white/30 font-mono">#{sub.id}</span>
                                                    <span className={`text-xs font-medium ${sub.verdict === 'Accepted' ? 'text-emerald-400' : sub.verdict === 'Wrong Answer' ? 'text-red-400' : 'text-orange-400'}`}>
                                                        {sub.verdict}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-white/40">
                                                    <span>{sub.time}</span>
                                                    <span>{sub.memory}</span>
                                                    <span>{sub.lang}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'analytics' && (
                                    <div className="space-y-6">
                                        {/* Runtime Distribution Chart */}
                                        <div>
                                            <h3 className="text-sm font-bold text-white mb-3">Runtime Distribution</h3>
                                            <div className="bg-black/30 rounded-lg p-4">
                                                <div className="flex items-end gap-2 h-32">
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '16px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '28px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '52px' }} />
                                                    <div className="w-8 bg-emerald-400 rounded-t hover:bg-emerald-300 transition-colors cursor-pointer" style={{ height: '92px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '110px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '80px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '46px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '24px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '12px' }} />
                                                    <div className="w-8 bg-emerald-500/70 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer" style={{ height: '6px' }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verdict Breakdown */}
                                        <div>
                                            <h3 className="text-sm font-bold text-white mb-3">Verdict Breakdown</h3>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-8 rounded-lg overflow-hidden flex">
                                                    <div className="bg-emerald-500 h-full hover:bg-emerald-400 transition-colors cursor-pointer" style={{ width: '68%' }} title="Accepted: 68%" />
                                                    <div className="bg-red-500 h-full hover:bg-red-400 transition-colors cursor-pointer" style={{ width: '22%' }} title="Wrong Answer: 22%" />
                                                    <div className="bg-emerald-600 h-full hover:bg-emerald-500 transition-colors cursor-pointer" style={{ width: '7%' }} title="TLE: 7%" />
                                                    <div className="bg-white/20 h-full hover:bg-white/30 transition-colors cursor-pointer" style={{ width: '3%' }} title="Other: 3%" />
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-3 text-[10px]">
                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> AC 68%</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> WA 22%</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> TLE 7%</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/30" /> Other 3%</span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="text-white/40 mb-1">Average Runtime</div>
                                                <div className="text-2xl font-bold text-emerald-400">124ms</div>
                                                <div className="text-[10px] text-white/30 mt-1">Faster than 76% of users</div>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="text-white/40 mb-1">Your Best</div>
                                                <div className="text-2xl font-bold text-white">46ms</div>
                                                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">Top 5% <Trophy size={10} /></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'solution' && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white">Editorial Solution</h3>
                                        <div className="text-xs text-white/60 leading-relaxed">
                                            <p className="mb-3">The key observation is that adjacent cells can be decremented together...</p>
                                        </div>
                                        <div className="bg-emerald-500/5 rounded-lg p-4 font-mono text-[13px]">
                                            <div className="text-[#C586C0]">#include <span className="text-[#ce9178]">&lt;bits/stdc++.h&gt;</span></div>
                                            <div className="text-[#C586C0]">using namespace <span className="text-[#9CDCFE]">std</span><span className="text-white">;</span></div>
                                            <div className="mt-2"><span className="text-[#569CD6]">int</span> <span className="text-[#DCDCAA] ml-1">main</span>() {'{'}</div>
                                            <div className="text-white/40 ml-4 font-medium italic">{/* Solution code here... */}</div>
                                            <div className="text-white">{'}'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel - Code Editor */}
                        <div className="w-full lg:w-1/2 flex flex-col">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0f0f0f]">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/60">Code</span>
                                    <Tooltip content="Language Selector" position="bottom">
                                        <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white/80 outline-none focus:border-emerald-500/50 [&>option]:bg-[#0a0a0a] [&>option]:text-white">
                                            <option>GNU C++20 (64)</option>
                                            <option>GNU C++17</option>
                                            <option>GNU C++14</option>
                                            <option>Python 3</option>
                                            <option>PyPy 3</option>
                                            <option>Java 21</option>
                                            <option>Java 17</option>
                                            <option>Kotlin 1.9</option>
                                            <option>Rust 2021</option>
                                            <option>Go 1.22</option>
                                            <option>C# 10</option>
                                            <option>Node.js</option>
                                            <option>Haskell</option>
                                            <option>Ruby</option>
                                        </select>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip content="Test Locally First" position="bottom">
                                        <button
                                            onClick={handleRunTests}
                                            disabled={testState === 'compiling' || testState === 'running' || submissionState !== 'idle'}
                                            className="px-3 py-1.5 text-[10px] font-medium bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {testState === 'compiling' && (
                                                <div className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin" />
                                            )}
                                            {testState === 'compiling' ? 'Compiling...' : 'Run Tests'}
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Submit via Extension" position="bottom">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submissionState !== 'idle' || testState === 'compiling' || testState === 'running'}
                                            className="px-3 py-1.5 text-[10px] font-medium bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            {submissionState === 'submitting' && (
                                                <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
                                            )}
                                            {submissionState === 'idle' ? 'Submit' : submissionState === 'submitting' ? 'Submitting...' : submissionState === 'judging' ? 'Judging...' : 'Submitted!'}
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Code Area */}
                            <div className="flex-1 bg-[#0a0a0a] font-mono text-[13px] overflow-auto custom-scrollbar">
                                <div className="flex min-h-full">
                                    {/* Monaco Gutter */}
                                    <div className="w-12 flex-shrink-0 bg-[#0a0a0a] border-r border-white/5 py-4 flex flex-col items-end pr-3 text-white/20 select-none">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                            <div key={n} className={`h-6 flex items-center ${n === 8 ? 'text-white/60' : ''}`}>
                                                {n}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Monaco Code View */}
                                    <div className="flex-1 py-4 relative">
                                        {/* Active Line Highlight (Line 8) */}
                                        <div className="absolute top-[calc(1rem+7*1.5rem)] left-0 w-full h-6 bg-white/[0.03] border-y border-white/[0.05] pointer-events-none" />

                                        <div className="relative z-10">
                                            <div className="h-6 flex items-center px-4">
                                                <span className="text-[#C586C0]">#include</span>
                                                <span className="text-[#ce9178] ml-2">&lt;bits/stdc++.h&gt;</span>
                                            </div>
                                            <div className="h-6 flex items-center px-4">
                                                <span className="text-[#C586C0]">using namespace</span>
                                                <span className="text-[#9CDCFE] ml-2">std</span>
                                                <span className="text-white">;</span>
                                            </div>
                                            <div className="h-6 flex items-center px-4"></div>
                                            <div className="h-6 flex items-center px-4">
                                                <span className="text-[#569CD6]">int</span>
                                                <span className="text-[#DCDCAA] ml-2">main</span>
                                                <span className="text-white">() {'{'}</span>
                                            </div>
                                            <div className="h-6 flex items-center px-8">
                                                <span className="text-[#9CDCFE]">ios_base</span>
                                                <span className="text-white">::</span>
                                                <span className="text-[#DCDCAA]">sync_with_stdio</span>
                                                <span className="text-white">(</span>
                                                <span className="text-[#B5CEA8]">0</span>
                                                <span className="text-white">);</span>
                                            </div>
                                            <div className="h-6 flex items-center px-8">
                                                <span className="text-[#9CDCFE]">cin</span>
                                                <span className="text-white">.</span>
                                                <span className="text-[#DCDCAA]">tie</span>
                                                <span className="text-white">(</span>
                                                <span className="text-[#B5CEA8]">0</span>
                                                <span className="text-white">);</span>
                                            </div>
                                            <div className="h-6 flex items-center px-4"></div>
                                            <div className="h-6 flex items-center px-8">
                                                <span className="text-[#C586C0]">return</span>
                                                <span className="text-[#B5CEA8] ml-2">0</span>
                                                <span className="text-white">;</span>
                                            </div>
                                            <div className="h-6 flex items-center px-4 text-white">{'}'}</div>
                                            <div className="h-6 flex items-center px-4">
                                                <div className="w-[1.5px] h-4 bg-emerald-400 animate-pulse ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Cases Panel */}
                            <div className="border-t border-white/5 bg-[#0d0d0d]">
                                <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
                                    <Tooltip content="Edit Test Inputs" position="top">
                                        <button className="text-xs font-medium text-white">Testcase</button>
                                    </Tooltip>
                                    <Tooltip content="View Results" position="top">
                                        <button className={`text-xs ${submissionState === 'accepted' ? 'text-emerald-400 font-medium' : 'text-white/40'}`}>
                                            Test Result {submissionState === 'accepted' && <Check size={10} className="inline ml-1" strokeWidth={3} />}
                                        </button>
                                    </Tooltip>
                                </div>
                                <div className="p-4">
                                    <div className="flex gap-2 mb-3">
                                        <Tooltip content="Sample Test 1" position="top">
                                            <button className="px-2 py-1 text-[10px] bg-white/10 text-white rounded">Case 1</button>
                                        </Tooltip>
                                        <Tooltip content="Sample Test 2" position="top">
                                            <button className="px-2 py-1 text-[10px] bg-white/5 text-white/40 rounded hover:bg-white/10 transition-colors">Case 2</button>
                                        </Tooltip>
                                        <Tooltip content="Add Custom Test" position="top">
                                            <button className="px-2 py-1 text-[10px] bg-white/5 text-white/40 rounded hover:bg-white/10 transition-colors">+</button>
                                        </Tooltip>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-[10px]">
                                        <Tooltip content="Test Input Data" position="top">
                                            <div>
                                                <div className="text-white/40 mb-1">INPUT</div>
                                                <div className="bg-black/50 rounded p-2 font-mono text-white/70">
                                                    5<br />2 6 1 3 2 5<br />4 4 1 1 2 1
                                                </div>
                                            </div>
                                        </Tooltip>
                                        <div>
                                            <div className="text-white/40 mb-1">EXPECTED OUTPUT</div>
                                            <div className="bg-black/50 rounded p-2 font-mono">
                                                <span className="text-emerald-400">YES</span><br />
                                                <span className="text-emerald-400">YES</span><br />
                                                <span className="text-red-400">NO</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 mb-1">ACTUAL OUTPUT</div>
                                            <div className={`bg-black/50 rounded p-2 font-mono ${submissionState === 'accepted' ? 'text-emerald-400' : testState === 'error' ? 'text-red-400' : 'text-white/30 italic'}`}>
                                                {submissionState === 'accepted' ? (
                                                    <>
                                                        YES<br />YES<br />NO
                                                    </>
                                                ) : submissionState === 'judging' ? (
                                                    <span className="text-emerald-400 animate-pulse">Judging...</span>
                                                ) : testState === 'compiling' ? (
                                                    <span className="text-emerald-400 animate-pulse">Compiling...</span>
                                                ) : testState === 'error' ? (
                                                    <span className="text-red-400">(no output)</span>
                                                ) : (
                                                    'Run tests to see output'
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compilation Error Banner */}
                                    {testState === 'error' && testError && (
                                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">!</span>
                                                </div>
                                                <span className="text-sm font-bold text-red-400">Compilation Error</span>
                                            </div>
                                            <div className="text-[10px] text-white/60 font-mono bg-black/30 rounded p-2">
                                                {testError}
                                            </div>
                                            <p className="text-[10px] text-white/40 mt-2">
                                                <Lightbulb className="w-3 h-3 inline mr-1 text-emerald-400" /> Tip: Add your solution logic to the code before running tests.
                                            </p>
                                        </div>
                                    )}

                                    {/* Verdict Banner */}
                                    {submissionState === 'accepted' && (
                                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-emerald-400">Accepted</div>
                                                <div className="text-[10px] text-white/50">Runtime: 46ms • Memory: 3.9MB</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Preview - High-fidelity mockup of the actual mobile UI */}
                <div className="md:hidden">
                    {/* Mobile Section Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black mb-2">
                            Mobile <span className="text-emerald-400">Ready</span>
                        </h2>
                        <p className="text-white/50 text-sm">
                            The full experience in the palm of your hand
                        </p>
                    </div>

                    <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl flex flex-col h-[500px]">
                        {/* Status Bar Mockup */}
                        <div className="flex justify-between items-center px-6 pt-2 pb-1 text-[10px] text-white/40 font-medium">
                            <span>10:28 PM</span>
                            <div className="flex items-center gap-1.5">
                                <Signal className="w-3 h-3" />
                                <Battery className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* App Header */}
                        <div className="bg-[#121212] border-b border-white/5 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4 text-white/40" />
                                <div className="flex items-center gap-1.5">
                                    <span className="text-emerald-400 font-bold text-xs">A.</span>
                                    <span className="text-white font-bold text-xs uppercase tracking-tight">Theater Square</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/40" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 text-[9px] text-white/40">
                                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 1s</span>
                                    <span className="flex items-center gap-0.5"><HardDrive className="w-2.5 h-2.5" /> 256MB</span>
                                </div>
                                <div className="w-5 h-5 relative">
                                    <Image src="/icons/logo.webp" alt="Logo" fill className="object-contain" />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="grid grid-cols-2 bg-[#121212] border-b border-white/5">
                            <button className="py-2.5 text-[11px] font-bold text-white border-b-2 border-emerald-500 flex items-center justify-center gap-1.5">
                                <FileText className="w-3 h-3" /> Problem
                            </button>
                            <button className="py-2.5 text-[11px] font-bold text-white/40 flex items-center justify-center gap-1.5">
                                <Code2 className="w-3 h-3" /> Code
                            </button>
                        </div>

                        {/* Sub-Tabs Scrollable */}
                        <div className="flex items-center gap-4 px-4 py-2 bg-[#0f0f0f] border-b border-white/5 overflow-hidden whitespace-nowrap">
                            {['Description', 'Submissions', 'Analytics', 'Solution'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveMobileTab(tab.toLowerCase())}
                                    className={`text-[10px] font-bold ${activeMobileTab === tab.toLowerCase() ? 'text-white border-b border-emerald-500' : 'text-white/30'} pb-0.5 transition-colors`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-5 overflow-auto bg-[#0a0a0a]">
                            {activeMobileTab === 'description' ? (
                                <>
                                    <h3 className="text-white font-bold text-base mb-3">Problem Statement</h3>
                                    <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                                        Theatre Square in the capital city of Berland has a rectangular shape with the size n × m meters...
                                    </p>

                                    {/* Input/Output Style */}
                                    <div className="space-y-3">
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Input</div>
                                            <div className="text-[10px] text-white/70">The input contains three positive integer numbers...</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                            <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Output</div>
                                            <div className="text-[10px] text-white/70">Write the needed number of flagstones.</div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-white/30">
                                    <p className="text-xs">Content placeholder for {activeMobileTab}</p>
                                </div>
                            )}
                        </div>

                        {/* Dynamic Floating Action Button */}
                        <div className="absolute bottom-4 right-4 items-end">
                            <div className="bg-emerald-500 text-black p-3 rounded-full shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-8 md:mt-12">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <Link
                            href="/contest/1/problem/A"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:scale-105"
                        >
                            Try it Live <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/extension"
                            target="_blank"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all hover:scale-105"
                        >
                            <div className="w-5 h-5 relative">
                                <Image src="/icons/logo.webp" alt="Logo" fill className="object-contain" />
                            </div>
                            Download Extension
                        </Link>
                    </div>
                </div>
            </div>
        </section >
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(PreviewWidget);
