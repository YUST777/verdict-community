import { useRef, useEffect, useCallback } from 'react';

interface UseResizableLayoutReturn {
    containerRef: React.RefObject<HTMLDivElement>;
    leftPanelRef: React.RefObject<HTMLDivElement>;
    handleMouseDown: (e: React.MouseEvent) => void;
    lastWidth: React.MutableRefObject<number>;
}

export function useResizableLayout(): UseResizableLayoutReturn {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const lastWidth = useRef(50);
    const isResizingRef = useRef(false);

    // Load saved width
    useEffect(() => {
        const savedWidth = localStorage.getItem('verdict-layout-width');
        if (savedWidth && leftPanelRef.current) {
            const width = parseFloat(savedWidth);
            if (!isNaN(width) && width >= 20 && width <= 80) {
                lastWidth.current = width;
                leftPanelRef.current.style.setProperty('--panel-width', `${width}%`);
            }
        }
    }, []);

    // Single persistent listener approach — no state, no re-renders
    useEffect(() => {
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current || !containerRef.current || !leftPanelRef.current) return;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!containerRef.current || !leftPanelRef.current) return;
                const containerRect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

                if (newWidth >= 20 && newWidth <= 80) {
                    lastWidth.current = newWidth;
                    leftPanelRef.current.style.setProperty('--panel-width', `${newWidth}%`);
                }
            });
        };

        const handleMouseUp = () => {
            if (!isResizingRef.current) return;
            isResizingRef.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            // Remove the overlay that prevents iframe/editor stealing pointer events
            const overlay = document.getElementById('resize-overlay');
            if (overlay) overlay.remove();
            localStorage.setItem('verdict-layout-width', lastWidth.current.toString());
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        // Add a transparent overlay to prevent Monaco editor / iframes from stealing mouse events
        const overlay = document.createElement('div');
        overlay.id = 'resize-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:col-resize;';
        document.body.appendChild(overlay);
    }, []);

    return {
        containerRef,
        leftPanelRef,
        handleMouseDown,
        lastWidth
    };
}
