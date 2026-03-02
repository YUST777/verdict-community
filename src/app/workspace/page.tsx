'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarTabs, TabData } from '@/components/mirror/problem/SidebarTabs';
import { ArrowRight, Loader2, PanelLeft, Link as LinkIcon } from 'lucide-react';
import ExtensionGate from '@/components/core/ExtensionGate';
import ExtensionOnboardingModal from '@/components/mirror/ExtensionOnboardingModal';
import { useAuth } from '@/contexts/AuthContext';
import { motion, useMotionValue, useMotionTemplate, useAnimationFrame } from "framer-motion";
import { cn } from '@/lib/utils';
import Image from 'next/image';

/* ─── Infinite Grid Background ─── */
const GridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => (
    <svg className="w-full h-full">
        <defs>
            <motion.pattern
                id="grid-pattern"
                width={size}
                height={size}
                patternUnits="userSpaceOnUse"
                x={offsetX}
                y={offsetY}
            >
                <path
                    d={`M ${size} 0 L 0 0 0 ${size}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-white/20"
                />
            </motion.pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
);

/* ─── URL Parser ─── */
function parseCodeforcesUrl(url: string) {
    if (!url) return null;
    const cleanUrl = url.split('?')[0].split('#')[0];

    const groupProblem = cleanUrl.match(/group\/([A-Za-z0-9]+)\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    if (groupProblem) return { type: 'group', groupId: groupProblem[1], contestId: groupProblem[2], problemId: groupProblem[3].toUpperCase(), isSheet: false };

    const contestProblem = cleanUrl.match(/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    if (contestProblem) return { type: 'contest', contestId: contestProblem[1], problemId: contestProblem[2].toUpperCase(), isSheet: false };

    const gymProblem = cleanUrl.match(/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    if (gymProblem) return { type: 'gym', contestId: gymProblem[1], problemId: gymProblem[2].toUpperCase(), isSheet: false };

    const problemset = cleanUrl.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
    if (problemset) return { type: 'problemset', contestId: problemset[1], problemId: problemset[2].toUpperCase(), isSheet: false };

    const acmsguru = cleanUrl.match(/problemsets\/acmsguru\/problem\/99999\/(\d+)/i);
    if (acmsguru) return { type: 'acmsguru', contestId: '99999', problemId: acmsguru[1], isSheet: false };

    const groupGeneric = cleanUrl.match(/group\/([A-Za-z0-9]+)\/contest\/(\d+)/i);
    if (groupGeneric) return { type: 'group', groupId: groupGeneric[1], contestId: groupGeneric[2], problemId: 'A', isSheet: true };

    const contestGeneric = cleanUrl.match(/contest\/(\d+)/i);
    if (contestGeneric) return { type: 'contest', contestId: contestGeneric[1], problemId: 'A', isSheet: true };

    const gymGeneric = cleanUrl.match(/gym\/(\d+)/i);
    if (gymGeneric) return { type: 'gym', contestId: gymGeneric[1], problemId: 'A', isSheet: true };

    return null;
}

/* ─── Recent Tab Row ─── */
const COLORS = [
    'bg-blue-500/20 text-blue-300',
    'bg-fuchsia-500/20 text-fuchsia-300',
    'bg-emerald-500/20 text-emerald-300',
    'bg-violet-500/20 text-violet-300',
    'bg-orange-500/20 text-orange-300',
    'bg-pink-500/20 text-pink-300',
    'bg-indigo-500/20 text-indigo-300',
    'bg-lime-500/20 text-lime-300',
];

function hashColor(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
}

/* ─── Main Page ─── */
export default function WorkspaceNewTabPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputUrl, setInputUrl] = useState('');
    const [fetching, setFetching] = useState(false);
    const [tabs, setTabs] = useState<TabData[]>([]);
    const [tabsLoaded, setTabsLoaded] = useState(false);

    // Grid state
    const gridSize = 40;
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const gridOffsetX = useMotionValue(0);
    const gridOffsetY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top } = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    useAnimationFrame(() => {
        gridOffsetX.set((gridOffsetX.get() + 0.5) % gridSize);
        gridOffsetY.set((gridOffsetY.get() + 0.5) % gridSize);
    });

    const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    // Fetch user tabs
    useEffect(() => {
        if (!user) { setTabsLoaded(true); return; }
        (async () => {
            try {
                const res = await fetch('/api/user/tabs');
                if (res.ok) {
                    const data = await res.json();
                    setTabs(data.data || []);
                }
            } catch (err: any) { console.error(err?.message || err); }
            finally { setTabsLoaded(true); }
        })();
    }, [user]);

    const saveTabs = async (newTabs: TabData[]) => {
        setTabs(newTabs);
        if (!user) return;
        try {
            await fetch('/api/user/tabs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tabs: newTabs })
            });
        } catch (err: any) { console.error(err?.message || err); }
    };

    // Auto-detection
    const parsed = parseCodeforcesUrl(inputUrl.trim());
    const detectionLabel = parsed
        ? parsed.isSheet
            ? `Detected: Entire Sheet (Contest ${parsed.contestId})`
            : `Detected: Single Problem (${parsed.contestId}/${parsed.problemId})`
        : null;

    // Smart submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parsed) return;

        setFetching(true);
        try {
            // Sheet mode: fetch all problems from contest
            if (parsed.isSheet && (parsed.type === 'contest' || parsed.type === 'gym')) {
                try {
                    const cfRes = await fetch(`https://codeforces.com/api/contest.standings?contestId=${parsed.contestId}&from=1&count=1`);
                    const data = await cfRes.json();

                    if (data.status === 'OK' && data.result?.problems) {
                        const newTabsList = data.result.problems.map((p: any) => ({
                            id: `${p.contestId}-${p.index}`,
                            title: p.name || `CF ${p.contestId}${p.index}`,
                            url: `/${parsed.type === 'gym' ? 'gym' : 'contest'}/${p.contestId}/problem/${p.index}`
                        }));

                        const existingUrls = new Set(tabs.map(t => t.url));
                        const toAdd = newTabsList.filter((t: TabData) => !existingUrls.has(t.url));

                        if (toAdd.length > 0) await saveTabs([...tabs, ...toAdd]);
                        if (newTabsList.length > 0) { router.push(newTabsList[0].url); return; }
                    }
                } catch (err: any) {
                    console.error("Sheet fetch failed", err?.message || err);
                }
            }

            // Single problem mode
            let route = '';
            if (parsed.type === 'group' && 'groupId' in parsed) {
                route = `/group/${parsed.groupId}/contest/${parsed.contestId}/problem/${parsed.problemId}`;
            } else if (parsed.type === 'gym') {
                route = `/gym/${parsed.contestId}/problem/${parsed.problemId}`;
            } else if (parsed.type === 'problemset') {
                route = `/problemset/problem/${parsed.contestId}/${parsed.problemId}`;
            } else if (parsed.type === 'acmsguru') {
                route = `/problemsets/acmsguru/problem/99999/${parsed.problemId}`;
            } else {
                route = `/contest/${parsed.contestId}/problem/${parsed.problemId}`;
            }

            if (tabs.some(t => t.url === route)) { router.push(route); return; }

            let title = `CF ${parsed.contestId}${parsed.problemId}`;
            try {
                const apiRes = await fetch(`/api/codeforces/problem-stats?contestId=${parsed.contestId}&problemIndex=${parsed.problemId}`);
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    if (data.success && data.problem?.name) title = data.problem.name;
                }
            } catch { }

            await saveTabs([...tabs, { id: `${parsed.contestId}-${parsed.problemId}`, title, url: route }]);
            router.push(route);
        } catch (err: any) {
            console.error(err?.message || err);
        } finally {
            setFetching(false);
        }
    };

    return (
        <ExtensionGate>
            <ExtensionOnboardingModal />
            <div className="fixed inset-0 bg-[#0B0B0C] text-[#DCDCDC] z-50 flex flex-row">
                <SidebarTabs
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(!isSidebarOpen)}
                    currentUrl="/workspace"
                />

                <main
                    className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-[#060606]"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                >
                    {/* Sidebar re-open button */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="absolute left-4 top-4 z-[100] p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white transition-all backdrop-blur-md cursor-pointer"
                        >
                            <PanelLeft size={20} />
                        </button>
                    )}

                    {/* Grid BG layers */}
                    <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
                        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
                    </div>
                    <motion.div
                        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                        style={{ maskImage, WebkitMaskImage: maskImage }}
                    >
                        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
                    </motion.div>
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
                        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
                    </div>

                    {/* Logo — top right */}
                    <div className="absolute top-4 right-5 z-20 flex items-center gap-2">
                        <Image src="/icons/logo.svg" alt="Verdict" width={24} height={24} className="size-6" />
                        <span className="text-sm font-bold tracking-tight text-white/60">verdict.run</span>
                    </div>

                    {/* ─── Content ─── */}
                    <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-6">

                        <h1 className="text-2xl md:text-3xl font-semibold text-white text-center mb-10 tracking-tight">
                            What will you solve next?
                        </h1>

                        {/* ─── Smart Search Bar ─── */}
                        <form onSubmit={handleSubmit} className="w-full group">
                            <div className={cn(
                                "relative flex items-center w-full rounded-2xl border transition-all duration-300",
                                "bg-white/[0.03] backdrop-blur-sm",
                                parsed
                                    ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                                    : "border-white/[0.08] hover:border-white/15"
                            )}>
                                <div className="pl-5 pr-3 text-white/25">
                                    <LinkIcon size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={inputUrl}
                                    onChange={e => setInputUrl(e.target.value)}
                                    placeholder="Paste any Codeforces link..."
                                    className="flex-1 bg-transparent text-white py-4 pr-2 text-sm font-mono placeholder:text-white/25 focus:outline-none"
                                    autoFocus
                                />
                                <div className="pr-3">
                                    <button
                                        type="submit"
                                        disabled={!parsed || fetching}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                                            parsed && !fetching
                                                ? "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105"
                                                : "bg-white/5 text-white/20"
                                        )}
                                    >
                                        {fetching
                                            ? <Loader2 size={18} className="animate-spin" />
                                            : <ArrowRight size={18} />
                                        }
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Detection indicator */}
                        <div className="h-8 mt-3 flex items-center justify-center">
                            {detectionLabel ? (
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={detectionLabel}
                                    className={cn(
                                        "text-xs font-medium px-3 py-1 rounded-full",
                                        parsed?.isSheet
                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}
                                >
                                    {detectionLabel}
                                </motion.p>
                            ) : inputUrl.length > 0 ? (
                                <p className="text-xs text-red-400/60">Not a valid Codeforces URL</p>
                            ) : (
                                <p className="text-xs text-white/20">Auto-detects: single problem or entire sheet</p>
                            )}
                        </div>

                        {/* ─── Recent Workspaces ─── */}
                        {tabsLoaded && tabs.length > 0 && (
                            <div className="w-full mt-12">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-px flex-1 bg-white/[0.06]" />
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold">Recent</span>
                                    <div className="h-px flex-1 bg-white/[0.06]" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    {tabs.slice(-8).reverse().map(tab => {
                                        const letter = tab.id.split('-').pop()?.[0]?.toUpperCase() || '?';
                                        const color = hashColor(tab.id);

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => router.push(tab.url)}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer text-left"
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0",
                                                    color
                                                )}>
                                                    {letter}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white/80 truncate group-hover:text-white transition-colors">
                                                        {tab.title}
                                                    </p>
                                                    <p className="text-[10px] text-white/25 font-mono truncate">
                                                        {tab.id.replace('-', ' ')}
                                                    </p>
                                                </div>
                                                <ArrowRight size={14} className="text-white/10 group-hover:text-white/40 transition-colors shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ExtensionGate>
    );
}
