'use client';

import { useState, useCallback } from 'react';
import { Minimize2, ExternalLink, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
    () => import('@/app/components/ExcalidrawWrapper'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-[#121212]">
                <div className="text-[#666] text-sm">Loading Whiteboard...</div>
            </div>
        )
    }
);

interface WhiteboardProps {
    contestId: string;
    problemIndex: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
    height?: number;
}

export default function Whiteboard({ contestId, problemIndex, isExpanded, onToggleExpand, height = 400 }: WhiteboardProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    // New scoped key structure (defaulting to 'primary' ID)
    const storageKey = `whiteboard-${contestId}-${problemIndex}-primary`;
    // Legacy key for migration
    const legacyKey = `whiteboard-${contestId}${problemIndex}`;

    // Load saved data from localStorage with migration
    const loadSavedData = useCallback(() => {
        if (typeof window === 'undefined') return null;
        try {
            // Try new key first
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                return JSON.parse(saved);
            }

            // Try to migrate legacy data
            const legacy = localStorage.getItem(legacyKey);
            if (legacy) {

                localStorage.setItem(storageKey, legacy);
                return JSON.parse(legacy);
            }
        } catch (e) {
            console.error('Failed to load whiteboard data:', e);
        }
        return null;
    }, [storageKey, legacyKey]);

    // Save data to localStorage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveData = useCallback((elements: readonly any[], appState: any) => {
        try {
            const data = {
                elements: [...elements],
                appState: {
                    viewBackgroundColor: appState.viewBackgroundColor,
                    zoom: appState.zoom,
                    scrollX: appState.scrollX,
                    scrollY: appState.scrollY,
                }
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save whiteboard data:', e);
        }
    }, [storageKey]);

    // Handle Excalidraw changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = useCallback((elements: readonly any[], appState: any) => {
        saveData(elements, appState);
    }, [saveData]);

    // Clear the whiteboard
    const handleClear = useCallback(() => {
        if (excalidrawAPI) {
            excalidrawAPI.resetScene();
            localStorage.removeItem(storageKey);
        }
    }, [excalidrawAPI, storageKey]);

    // Open in new tab
    const handleOpenInNewTab = useCallback(() => {
        const url = `/whiteboard/${contestId}/${problemIndex}/primary`;
        window.open(url, '_blank');
    }, [contestId, problemIndex]);

    // Get initial data
    const savedData = loadSavedData();

    return (
        <div
            className={`flex flex-col bg-[#1a1a1a] border-t border-white/10 shrink-0 transition-all duration-300 overflow-hidden`}
            style={{ height: isExpanded ? height : 0 }}
        >
            {isExpanded && (
                <>
                    {/* Whiteboard Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <path d="M9 9l6 6m0-6l-6 6" />
                            </svg>
                            <span className="text-sm font-medium text-white">Whiteboard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClear}
                                className="p-1.5 text-[#666] hover:text-red-400 transition-colors rounded hover:bg-white/5"
                                title="Clear whiteboard"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button
                                onClick={handleOpenInNewTab}
                                className="p-1.5 text-[#666] hover:text-white transition-colors rounded hover:bg-white/5"
                                title="Open in new tab"
                            >
                                <ExternalLink size={14} />
                            </button>
                            <button
                                onClick={onToggleExpand}
                                className="p-1.5 text-[#666] hover:text-white transition-colors rounded hover:bg-white/5"
                                title="Minimize"
                            >
                                <Minimize2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Excalidraw Container */}
                    <div className="flex-1 min-h-0">
                        <Excalidraw
                            excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
                            initialData={savedData}
                            onChange={handleChange}
                            theme="dark"
                            UIOptions={{
                                canvasActions: {
                                    saveAsImage: true,
                                    loadScene: false,
                                    export: false,
                                    clearCanvas: false,
                                },
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
