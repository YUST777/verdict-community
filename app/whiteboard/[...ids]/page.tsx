'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Download } from 'lucide-react';


const Excalidraw = dynamic(
    () => import('@/app/components/ExcalidrawWrapper'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-screen bg-[#121212]">
                <div className="text-[#666]">Loading Whiteboard...</div>
            </div>
        )
    }
);

export default function WhiteboardPage() {
    const params = useParams();
    const router = useRouter();

    // Catch-all param parsing: /whiteboard/[contestId]/[problemIndex]/[whiteboardId]
    const ids = params.ids as string[] | undefined;

    // Parse IDs early - use empty strings as fallbacks for hooks
    const contestId = ids?.[0] || '';
    const problemIndex = ids?.[1] || '';
    const whiteboardId = ids?.[2] || 'primary';

    // Interface for Excalidraw API
    interface ExcalidrawAPI {
        resetScene: () => void;
        getSceneElements: () => unknown[];
        getAppState: () => Record<string, unknown>;
        getFiles: () => Record<string, unknown>;
    }

    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);

    // New scoped key structure
    const storageKey = `whiteboard-${contestId}-${problemIndex}-${whiteboardId}`;
    // Legacy key for migration
    const legacyKey = `whiteboard-${contestId}${problemIndex}`;

    // Use custom hook for persistence (debounced)
    const { initialData, triggerSave } = useWhiteboardPersistence(
        storageKey,
        legacyKey,
        whiteboardId === 'primary'
    );

    // Handle changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = useCallback((elements: readonly any[], appState: any) => {
        triggerSave(elements, appState);
    }, [triggerSave]);

    const handleClear = useCallback(() => {
        if (excalidrawAPI) {
            excalidrawAPI.resetScene();
            localStorage.removeItem(storageKey);
        }
    }, [excalidrawAPI, storageKey]);

    const handleExport = useCallback(async () => {
        if (!excalidrawAPI) return;
        try {
            const elements = excalidrawAPI.getSceneElements();
            if (!elements || elements.length === 0) return;

            const { exportToBlob } = await import('@excalidraw/excalidraw');

            const blob = await exportToBlob({
                elements,
                appState: {
                    ...excalidrawAPI.getAppState(),
                    exportWithDarkMode: true,
                },
                files: excalidrawAPI.getFiles(),
            });

            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `whiteboard-${contestId}${problemIndex}-${whiteboardId}.png`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('Failed to export:', e);
        }
    }, [excalidrawAPI, contestId, problemIndex, whiteboardId]);

    // Ensure we have at least contestId and problemIndex - render error after hooks
    if (!ids || ids.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white gap-4">
                <h1 className="text-xl font-bold">Invalid Whiteboard URL</h1>
                <p className="text-[#888]">Expected format: /whiteboard/contestId/problemIndex/whiteboardId</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-[#10B981] text-[#121212] rounded font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-screen w-full bg-[#121212]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-[#666] hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-lg flex items-center gap-2">
                            Problem {contestId}{problemIndex}
                            <span className="text-[#666] text-sm font-normal">/</span>
                            <span className="text-[#10B981] text-sm px-2 py-0.5 bg-[#10B981]/10 rounded border border-[#10B981]/20 font-mono">
                                {whiteboardId === 'primary' ? 'Solo' : whiteboardId}
                            </span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#666] hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                    >
                        <Trash2 size={16} />
                        Clear
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#121212] bg-[#10B981] hover:bg-[#059669] transition-colors rounded-lg"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full min-h-0">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api as unknown as ExcalidrawAPI)}
                    initialData={initialData}
                    onChange={handleChange}
                    theme="dark"
                    UIOptions={{
                        canvasActions: {
                            saveAsImage: false,
                            loadScene: true,
                            export: false,
                            clearCanvas: false,
                        }
                    }}
                />
            </div>
        </div>
    );
}

// --- Hooks ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WhiteboardData = any; // Excalidraw's internal data structure

function useWhiteboardPersistence(storageKey: string, legacyKey: string, isPrimary: boolean) {
    const [initialData] = useState<WhiteboardData | null>(() => {
        if (typeof window === 'undefined') return null;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);

            if (isPrimary) {
                const legacy = localStorage.getItem(legacyKey);
                if (legacy) return JSON.parse(legacy);
            }
        } catch (e) {
            console.error('Failed to load whiteboard:', e);
        }
        return null;
    });

    useEffect(() => {
        if (isPrimary) {
            const current = localStorage.getItem(storageKey);
            if (!current) {
                const legacy = localStorage.getItem(legacyKey);
                if (legacy) {
                    localStorage.setItem(storageKey, legacy);
                }
            }
        }
    }, [isPrimary, storageKey, legacyKey]);

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerSave = useCallback((elements: readonly any[], appState: any) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
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
                console.error('Failed to save:', e);
            }
        }, 1000);
    }, [storageKey]);

    return { initialData, triggerSave };
}
