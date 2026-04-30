'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, RotateCw, Lock, Plus, X, FileText, Code2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Component — Verdict.run IDE showcase (matches screenshot design)
// ---------------------------------------------------------------------------

export function AppShowcase() {
    const [activeDescTab] = useState<'description' | 'submissions' | 'analytics' | 'solution'>('description')
    const [activeTestTab] = useState<'testcase' | 'result'>('testcase')
    const [activeCase] = useState(1)
    const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem')

    return (
        <div className="bg-[#111111] h-[600px] sm:h-auto sm:aspect-[15/8] w-full rounded-2xl overflow-hidden flex flex-col select-none text-[13px]">

            {/* ============================================================= */}
            {/* Browser Chrome — Tab bar */}
            {/* ============================================================= */}
            <div className="bg-[#1a1a1a] flex items-end px-3 pt-2.5 shrink-0">
                {/* Traffic lights */}
                <div className="flex items-center gap-2 pb-2.5 pr-4 shrink-0">
                    <div className="size-3 rounded-full bg-[#ff5f57]" />
                    <div className="size-3 rounded-full bg-[#febc2e]" />
                    <div className="size-3 rounded-full bg-[#28c840]" />
                </div>
                {/* Tab */}
                <div className="flex items-center gap-2 bg-[#111111] rounded-t-lg px-4 py-2 max-w-[280px] min-w-0">
                    {/* Verdict favicon */}
                    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none">
                        <path d="M4 5l8 14 8-14" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-white/70 text-xs truncate">A. Kill Two Birds with One Stone</span>
                    <X className="size-3 text-white/20 shrink-0 ml-auto" />
                </div>
                {/* Empty space to fill tab bar */}
                <div className="flex-1" />
            </div>

            {/* ============================================================= */}
            {/* Browser Chrome — URL bar */}
            {/* ============================================================= */}
            <div className="bg-[#1a1a1a] border-b border-white/[0.06] px-4 pb-2.5 shrink-0">
                <div className="flex items-center gap-2">
                    {/* Nav buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                        <ChevronLeft className="size-4 text-white/20" />
                        <ChevronRight className="size-4 text-white/20" />
                        <RotateCw className="size-3.5 text-white/20 ml-1" />
                    </div>
                    {/* URL bar */}
                    <div className="flex-1 flex items-center bg-[#0d0d0d] rounded-lg px-3 py-1.5 gap-2 min-w-0">
                        <Lock className="size-3 text-white/20 shrink-0" />
                        <div className="flex items-center gap-1 min-w-0 text-xs">
                            <span className="text-emerald-400 font-medium shrink-0">verdict.run</span>
                            <span className="text-white/30 truncate">/gym/106259/problem/A</span>
                        </div>
                        <span className="hidden sm:flex items-center gap-1.5 ml-auto text-white/20 text-[11px] shrink-0">
                            <span className="text-white/15">codeforces.com/gym/106259/problem/A</span>
                            <span className="text-emerald-400">&rarr;</span>
                        </span>
                    </div>
                    {/* Verdict icon in URL bar area */}
                    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none">
                        <path d="M4 5l8 14 8-14" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* ============================================================= */}
            {/* Main content area */}
            {/* ============================================================= */}
            <div className="flex flex-1 min-h-0 relative">

                {/* ======================================================= */}
                {/* LEFT: Problem panel */}
                {/* ======================================================= */}
                <div className={cn(
                    "flex-1 flex flex-col min-w-0 border-r border-white/[0.06]",
                    mobileTab === 'code' ? 'hidden lg:flex' : 'flex'
                )}>

                    {/* Problem title + time/memory */}
                    <div className="px-5 pt-4 pb-3 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-white/90 font-semibold text-[15px]">A.</span>
                                <span className="text-white/90 font-semibold text-[15px] truncate">Kill Two Birds with One Stone</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-3 text-xs text-white/30 shrink-0 ml-4">
                                <span className="flex items-center gap-1">
                                    <ClockIcon />
                                    1s
                                </span>
                                <span className="flex items-center gap-1">
                                    <MemoryIcon />
                                    256MB
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description tabs */}
                    <div className="flex border-b border-white/[0.06] px-5 shrink-0">
                        {(['Description', 'Submissions', 'Analytics', 'Solution'] as const).map((tab) => {
                            const key = tab.toLowerCase() as typeof activeDescTab
                            const isActive = activeDescTab === key
                            return (
                                <button
                                    key={tab}
                                    className={cn(
                                        'px-3 py-2 text-xs transition-colors cursor-pointer relative',
                                        isActive
                                            ? 'text-white/80'
                                            : 'text-white/25 hover:text-white/40',
                                    )}>
                                    {tab}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-white/60 rounded-full" />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Problem body */}
                    <div className="flex-1 overflow-y-auto min-h-0 p-5 custom-scrollbar">
                        <div className="space-y-5 text-[13px] leading-relaxed">
                            {/* Problem Statement */}
                            <div>
                                <h3 className="text-white/80 font-bold text-sm mb-3">Problem Statement</h3>
                                <p className="text-white/45 leading-[1.7]">
                                    Why are lots of things in twos? Hands on clocks, and gloves, and shoes, Scissor-blades, and water taps, Collar studs, and luggage straps...
                                </p>
                                <p className="text-white/45 leading-[1.7] mt-3">
                                    You are given a binary matrix <span className="text-white/70 bg-white/[0.05] px-1.5 py-0.5 rounded text-xs font-mono">M</span> of
                                    size <span className="text-white/70 bg-white/[0.05] px-1.5 py-0.5 rounded text-xs font-mono">n</span> &times; <span className="text-white/70 bg-white/[0.05] px-1.5 py-0.5 rounded text-xs font-mono">m</span>,
                                    where rows are numbered from 1 to n from top to bottom and columns are numbered from 1 to m from left to right.
                                </p>
                                <p className="text-white/45 leading-[1.7] mt-3">
                                    Your task is to determine whether it is possible to transform the matrix into a null matrix (i.e., a matrix where all entries are 0).
                                </p>
                            </div>

                            {/* INPUT and OUTPUT side by side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                                <div>
                                    <h3 className="text-white/80 font-bold text-sm mb-2">INPUT</h3>
                                    <p className="text-white/45 leading-[1.7] text-xs">
                                        The first line contains <span className="text-white/70 bg-white/[0.05] px-1 py-0.5 rounded font-mono">t</span> (1 &le; t &le; 10<sup>4</sup>) &mdash; the number of test cases.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-white/80 font-bold text-sm mb-2">OUTPUT</h3>
                                    <p className="text-white/45 leading-[1.7] text-xs">
                                        For each test case, output YES if possible, NO otherwise.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ======================================================= */}
                {/* RIGHT: Code + Tests panel (desktop only) */}
                {/* ======================================================= */}
                <div className={cn(
                    "w-full lg:w-[46%] flex-col shrink-0",
                    mobileTab === 'problem' ? 'hidden lg:flex' : 'flex'
                )}>

                    {/* Code header: Code | GNU C++20 (64) | Run Tests | Submit */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-white/50 text-xs font-medium">Code</span>
                            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1">
                                <span className="text-white/40 text-[11px] font-mono">GNU C++20 (64)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-xs rounded-md bg-white/[0.04] border border-white/[0.08] text-white/40 hover:bg-white/[0.08] transition-colors cursor-pointer">
                                Run Tests
                            </button>
                            <button className="px-4 py-1.5 text-xs rounded-md bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors cursor-pointer">
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Code editor */}
                    <div className="flex-1 min-h-0 overflow-y-auto bg-[#0d0d0d] custom-scrollbar">
                        <CodeEditor />
                    </div>

                    {/* ===================================================== */}
                    {/* Test cases panel */}
                    {/* ===================================================== */}
                    <div className="border-t border-white/[0.06] shrink-0 flex flex-col">
                        {/* Testcase / Test Result tabs */}
                        <div className="flex items-center border-b border-white/[0.06] px-4">
                            {(['Testcase', 'Test Result'] as const).map((tab) => {
                                const isActive = (tab === 'Testcase' && activeTestTab === 'testcase') || (tab === 'Test Result' && activeTestTab === 'result')
                                return (
                                    <button
                                        key={tab}
                                        className={cn(
                                            'px-3 py-2 text-xs transition-colors cursor-pointer relative',
                                            isActive
                                                ? 'text-white/70 font-medium'
                                                : 'text-white/25 hover:text-white/40',
                                        )}>
                                        {tab}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-white/40 rounded-full" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Case selector: Case 1 | Case 2 | + */}
                        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.06]">
                            {[1, 2].map((c) => (
                                <button
                                    key={c}
                                    className={cn(
                                        'px-3 py-1 text-[11px] rounded-md transition-colors cursor-pointer',
                                        activeCase === c
                                            ? 'bg-white/[0.08] text-white/70 border border-white/[0.12]'
                                            : 'text-white/25 border border-transparent hover:text-white/40 hover:bg-white/[0.03]',
                                    )}>
                                    Case {c}
                                </button>
                            ))}
                            <button className="size-6 flex items-center justify-center rounded-md text-white/20 hover:text-white/40 hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent">
                                <Plus className="size-3" />
                            </button>
                        </div>

                        {/* 3-column test data: INPUT | EXPECTED OUTPUT | ACTUAL OUTPUT */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 min-h-[80px] sm:max-h-[120px] overflow-y-auto custom-scrollbar">
                            {/* INPUT column */}
                            <div className="border-b sm:border-b-0 sm:border-r border-white/[0.06] p-3">
                                <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium block mb-2">INPUT</span>
                                <pre className="text-white/50 text-[11px] font-mono leading-5 whitespace-pre">5{'\n'}2 6 1 3 2 5{'\n'}4 4 1 1 2 1</pre>
                            </div>
                            {/* EXPECTED OUTPUT column */}
                            <div className="border-b sm:border-b-0 sm:border-r border-white/[0.06] p-3">
                                <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium block mb-2">EXPECTED OUTPUT</span>
                                <pre className="text-[11px] font-mono leading-5 whitespace-pre"><span className="text-emerald-400">YES</span>{'\n'}<span className="text-emerald-400">YES</span>{'\n'}<span className="text-red-400">NO</span></pre>
                            </div>
                            {/* ACTUAL OUTPUT column */}
                            <div className="p-3">
                                <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium block mb-2">ACTUAL OUTPUT</span>
                                <pre className="text-white/15 text-[11px] font-mono italic">Run tests to see output</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================= */}
            {/* Mobile Bottom Tab Bar */}
            {/* ============================================================= */}
            <div className="lg:hidden flex border-t border-white/[0.06] bg-[#1a1a1a] shrink-0">
                <button
                    onClick={() => setMobileTab('problem')}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative",
                        mobileTab === 'problem' ? "text-emerald-400" : "text-white/40"
                    )}
                >
                    <FileText className="size-5" />
                    <span className="text-[10px] font-medium">Problem</span>
                    {mobileTab === 'problem' && (
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-400" />
                    )}
                </button>
                <div className="w-px bg-white/[0.06]" />
                <button
                    onClick={() => setMobileTab('code')}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative",
                        mobileTab === 'code' ? "text-emerald-400" : "text-white/40"
                    )}
                >
                    <Code2 className="size-5" />
                    <span className="text-[10px] font-medium">Code</span>
                    {mobileTab === 'code' && (
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-400" />
                    )}
                </button>
            </div>
        </div >
    )
}

// ---------------------------------------------------------------------------
// Code Editor — matches screenshot syntax highlighting
// ---------------------------------------------------------------------------

function CodeEditor() {
    const lines: { num: number; tokens: { text: string; color: string }[] }[] = [
        {
            num: 1,
            tokens: [
                { text: '#include', color: 'text-[#c586c0]' },
                { text: ' <bits/stdc++.h>', color: 'text-[#ce9178]' },
            ],
        },
        {
            num: 2,
            tokens: [
                { text: 'using', color: 'text-[#569cd6]' },
                { text: ' ', color: '' },
                { text: 'namespace', color: 'text-[#569cd6]' },
                { text: ' ', color: '' },
                { text: 'std', color: 'text-white/70' },
                { text: ';', color: 'text-white/40' },
            ],
        },
        { num: 3, tokens: [] },
        {
            num: 4,
            tokens: [
                { text: 'int', color: 'text-[#569cd6]' },
                { text: ' ', color: '' },
                { text: 'main', color: 'text-[#dcdcaa]' },
                { text: '() {', color: 'text-white/40' },
            ],
        },
        {
            num: 5,
            tokens: [
                { text: '    ios_base', color: 'text-[#4ec9b0]' },
                { text: '::', color: 'text-white/30' },
                { text: 'sync_with_stdio', color: 'text-[#dcdcaa]' },
                { text: '(', color: 'text-white/40' },
                { text: '0', color: 'text-[#b5cea8]' },
                { text: ');', color: 'text-white/40' },
            ],
        },
        {
            num: 6,
            tokens: [
                { text: '    cin', color: 'text-[#4ec9b0]' },
                { text: '.', color: 'text-white/30' },
                { text: 'tie', color: 'text-[#dcdcaa]' },
                { text: '(', color: 'text-white/40' },
                { text: '0', color: 'text-[#b5cea8]' },
                { text: ');', color: 'text-white/40' },
            ],
        },
        { num: 7, tokens: [] },
        {
            num: 8,
            tokens: [
                { text: '    ', color: '' },
                { text: 'return', color: 'text-[#c586c0]' },
                { text: ' ', color: '' },
                { text: '0', color: 'text-[#b5cea8]' },
                { text: ';', color: 'text-white/40' },
            ],
        },
        {
            num: 9,
            tokens: [
                { text: '}', color: 'text-white/40' },
            ],
        },
    ]

    return (
        <div className="font-mono text-[13px] leading-7 py-2">
            {lines.map((line) => (
                <div key={line.num} className="flex hover:bg-white/[0.02] px-4">
                    <span className="text-white/15 w-8 text-right mr-6 shrink-0 select-none">{line.num}</span>
                    <span>
                        {line.tokens.length === 0 ? (
                            <span>&nbsp;</span>
                        ) : (
                            line.tokens.map((token, i) => (
                                <span key={i} className={token.color}>{token.text}</span>
                            ))
                        )}
                    </span>
                </div>
            ))}
            {/* Cursor line */}
            <div className="flex hover:bg-white/[0.02] px-4">
                <span className="text-white/15 w-8 text-right mr-6 shrink-0 select-none">10</span>
                <span className="inline-block w-[2px] h-[18px] bg-white/60 animate-pulse" />
            </div>
            {/* Empty lines */}
            {[11, 12].map((n) => (
                <div key={n} className="flex hover:bg-white/[0.02] px-4">
                    <span className="text-white/15 w-8 text-right mr-6 shrink-0 select-none">{n}</span>
                </div>
            ))}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ClockIcon() {
    return (
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function MemoryIcon() {
    return (
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <line x1="9" y1="2" x2="9" y2="4" />
            <line x1="15" y1="2" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="22" />
            <line x1="15" y1="20" x2="15" y2="22" />
            <line x1="20" y1="9" x2="22" y2="9" />
            <line x1="20" y1="15" x2="22" y2="15" />
            <line x1="2" y1="9" x2="4" y2="9" />
            <line x1="2" y1="15" x2="4" y2="15" />
        </svg>
    )
}
