'use client';

import React, { useEffect, useState } from 'react';
import {
    Plus, X, Loader2, Settings, HelpCircle, PanelLeft,
    FileCode, FileText, FileCog, FileSearch, FileCheck,
    FileType, FileInput, FileOutput, FileCode2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';


// Map problem index letters to distinct lucide icons for crisp rendering
const LETTER_ICONS: Record<string, React.ElementType> = {
    A: FileCode,
    B: FileText,
    C: FileCog,
    D: FileSearch,
    E: FileCheck,
    F: FileType,
    G: FileInput,
    H: FileOutput,
};

export interface TabData {
    id: string; // e.g. "4-A"
    title: string;
    url: string; // internal route
}

interface SidebarTabsProps {
    isOpen: boolean;
    onClose: () => void;
    currentUrl: string;
}

// Map characters to beautiful colors
const COLORS = [
    'bg-[#1e40af] text-blue-200',   // Deep Blue
    'bg-[#86198f] text-fuchsia-200',// Deep Fuchsia
    'bg-[#064e3b] text-emerald-200',// Dark Emerald
    'bg-[#4d7c0f] text-lime-200',   // Dark Lime
    'bg-[#4c1d95] text-violet-200', // Deep Violet
    'bg-[#7c2d12] text-orange-200', // Dark Orange
    'bg-[#831843] text-pink-200',   // Dark Pink
    'bg-[#312e81] text-indigo-200', // Deep Indigo
];

function getColorForTitle(title: string) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
}

export function SidebarTabs({ isOpen, onClose, currentUrl }: SidebarTabsProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [tabs, setTabs] = useState<TabData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Sync active tab ID from session storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActiveTabId(sessionStorage.getItem('activeVerdictTabId'));
        }
    }, [currentUrl, tabs]);

    useEffect(() => {
        if (!isOpen || !user) {
            if (!user) setLoading(false);
            return;
        }

        const fetchTabs = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/user/tabs');
                if (res.ok) {
                    const data = await res.json();
                    setTabs(data.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTabs();
    }, [isOpen, user]);

    const saveTabs = async (newTabs: TabData[]) => {
        setTabs(newTabs);
        if (!user) return;
        try {
            await fetch('/api/user/tabs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tabs: newTabs })
            });
        } catch (err) {
            console.error('Failed to save tabs', err);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newTabs = tabs.filter(t => t.id !== id);
        await saveTabs(newTabs);
    };

    return (
        <div
            style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }}
            className={`
                relative flex flex-col items-center bg-[#0B0B0C] md:bg-[#060606]
                border-r border-white/5 shrink-0
                transition-[width,min-width] duration-300 ease-in-out
                ${isOpen ? 'w-[52px] min-w-[52px]' : 'w-0 min-w-0 overflow-hidden'}
            `}
        >
            {/* Top Area: Logo linking to home OR Sidebar Toggle */}
            <div
                className={`mt-3 mb-4 flex-shrink-0 ${isOpen ? 'block' : 'hidden'}`}
                title={currentUrl === '/workspace' ? "Toggle Sidebar" : "Verdict Home"}
            >
                {currentUrl === '/workspace' ? (
                    <div
                        className="p-2 text-white/30 hover:text-white transition cursor-pointer"
                        onClick={onClose}
                    >
                        <PanelLeft size={20} />
                    </div>
                ) : (
                    <Link href="/">
                        <div className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                            <Image
                                src="/icons/logo.svg"
                                alt="Verdict"
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        </div>
                    </Link>
                )}
            </div>

            {/* Scrollable Tab List */}
            <div className={`flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto no-scrollbar py-2 ${isOpen ? 'block' : 'hidden'}`}>
                {loading ? (
                    <div className="mt-6 flex justify-center w-full">
                        <Loader2 className="animate-spin text-white/30" size={24} />
                    </div>
                ) : !user ? (
                    <div className="text-white/30 p-2 hover:text-white cursor-help group relative">
                        <X size={20} />
                        <div className="absolute left-10 top-0 w-[180px] bg-[#1A1A1A] border border-white/10 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            Login to save workspaces!
                        </div>
                    </div>
                ) : (
                    <>
                        {tabs.map((tab) => {
                            // A tab is active if it's explicitly the active tab in session storage, 
                            // or fallback to URL matching if no session tab is set (like on deep entry link)
                            const isActive = activeTabId === tab.id || (!activeTabId && currentUrl.includes(tab.url) && tab.url !== '/workspace');

                            const iconLetter = tab.id.split('-').pop()?.[0]?.toUpperCase() || 'A';
                            const colorClass = getColorForTitle(tab.id);
                            const IconComponent = (LETTER_ICONS[iconLetter] || FileCode2) as React.ElementType;

                            return (
                                <div key={tab.id} className="relative group w-full flex justify-center">
                                    <div
                                        onClick={() => {
                                            sessionStorage.setItem('activeVerdictTabId', tab.id);
                                            setActiveTabId(tab.id);
                                            router.push(tab.url);
                                        }}
                                        style={{ backfaceVisibility: 'hidden' }}
                                        className={`
                                            relative flex items-center justify-center w-[36px] h-[36px] rounded-[10px] 
                                            cursor-pointer transition-colors duration-200
                                            ${colorClass}
                                            ${isActive ? 'ring-2 ring-offset-2 ring-offset-[#060606] ring-white shadow-md shadow-white/10 brightness-110' : 'brightness-75 hover:brightness-100'}
                                        `}
                                    >
                                        <IconComponent size={18} strokeWidth={1.75} />

                                        {/* Hover Tooltip */}
                                        <div className="absolute left-[50px] top-1/2 -translate-y-1/2 bg-[#1A1A1A] border border-white/10 px-3 py-2 rounded-lg shadow-2xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 min-w-[150px] flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">{tab.id.replace('-', ' ')}</span>
                                                <span className="text-white text-xs whitespace-nowrap">{tab.title}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete indicator/button on hover (overlay on icon) */}
                                    <button
                                        onClick={(e) => handleDelete(tab.id, e)}
                                        className="absolute -top-1 -right-1 bg-red-500/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                                        title="Close Tab"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                </div>
                            );
                        })}

                        {/* Plus Button (New Tab) */}
                        <div className="relative group w-full flex justify-center mt-2">
                            <button
                                onClick={async () => {
                                    // Make sure we have a new clean tab on workspace
                                    const newTabId = `tab-${Date.now()}`;
                                    const newTabs = [...tabs, { id: newTabId, title: 'New Tab', url: '/workspace' }];
                                    await saveTabs(newTabs);

                                    // Set this new tab as active
                                    sessionStorage.setItem('activeVerdictTabId', newTabId);
                                    setActiveTabId(newTabId);

                                    router.push('/workspace');
                                }}
                                className={`
                                    flex items-center justify-center w-[36px] h-[36px] rounded-[10px] 
                                    transition-all duration-200
                                    ${currentUrl === '/workspace' && activeTabId === null ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <Plus size={20} className={currentUrl === '/workspace' && activeTabId === null ? 'rotate-45 transition-transform' : 'transition-transform'} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Actions */}
            <div className={`pb-4 pt-2 flex-shrink-0 flex flex-col gap-4 items-center ${isOpen ? 'block' : 'hidden'}`}>
                <button className="text-white/30 hover:text-white transition p-2 cursor-pointer" title="Settings">
                    <Settings size={20} />
                </button>
                <button className="text-white/30 hover:text-white transition p-2 cursor-pointer" title="Help">
                    <HelpCircle size={20} />
                </button>
            </div>
        </div>
    );
}
