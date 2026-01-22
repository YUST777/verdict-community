import { useRef, useState, useEffect, useCallback } from 'react';

interface UseResizableLayoutReturn {
    containerRef: React.RefObject<HTMLDivElement>;
    leftPanelRef: React.RefObject<HTMLDivElement>;
    isResizing: boolean;
    handleMouseDown: (e: React.MouseEvent) => void;
    lastWidth: React.MutableRefObject<number>;
}

export function useResizableLayout(): UseResizableLayoutReturn {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const lastWidth = useRef(50);
    const [isResizing, setIsResizing] = useState(false);

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

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    // Apply cursor styles when resizing starts
    useEffect(() => {
        if (isResizing) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
    }, [isResizing]);

    useEffect(() => {
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current || !leftPanelRef.current) return;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!containerRef.current) return;
                const containerRect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

                if (newWidth >= 20 && newWidth <= 80) {
                    lastWidth.current = newWidth;
                    leftPanelRef.current!.style.setProperty('--panel-width', `${newWidth}%`);
                }
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            localStorage.setItem('verdict-layout-width', lastWidth.current.toString());
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isResizing]);

    return {
        containerRef,
        leftPanelRef,
        isResizing,
        handleMouseDown,
        lastWidth
    };
}

