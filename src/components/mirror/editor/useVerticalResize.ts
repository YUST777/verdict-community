'use client';

import { useState, useEffect, useRef, RefObject } from 'react';

interface UseVerticalResizeOptions {
    containerRef: RefObject<HTMLDivElement | null>;
    minHeight?: number;
    maxHeight?: number;
    storageKey?: string;
    defaultHeight?: number;
}

export function useVerticalResize({
    containerRef,
    minHeight = 15,
    maxHeight = 85,
    storageKey = 'verdict-layout-test-height',
    defaultHeight = 35
}: UseVerticalResizeOptions) {
    const [isResizing, setIsResizing] = useState(false);
    const lastHeight = useRef(defaultHeight);

    // Load saved height on mount
    useEffect(() => {
        const savedHeight = localStorage.getItem(storageKey);
        if (savedHeight && containerRef.current) {
            const height = parseFloat(savedHeight);
            if (!isNaN(height) && height >= minHeight && height <= maxHeight) {
                lastHeight.current = height;
                containerRef.current.style.setProperty('--test-panel-h', `${height}%`);
            }
        }
    }, [containerRef, minHeight, maxHeight, storageKey]);

    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        setIsResizing(true);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        let animationFrameId: number;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isResizing || !containerRef.current) return;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!containerRef.current) return;
                let clientY: number;
                if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
                    clientY = e.touches[0].clientY;
                } else {
                    clientY = (e as MouseEvent).clientY;
                }

                const containerRect = containerRef.current.getBoundingClientRect();
                const newHeight = ((containerRect.bottom - clientY) / containerRect.height) * 100;

                if (newHeight >= minHeight && newHeight <= maxHeight) {
                    containerRef.current.style.setProperty('--test-panel-h', `${newHeight}%`);
                    lastHeight.current = newHeight;
                }
            });
        };

        const handleEnd = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            localStorage.setItem(storageKey, lastHeight.current.toString());
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isResizing, containerRef, minHeight, maxHeight, storageKey]);

    return {
        isResizing,
        handleResizeStart,
        lastHeight
    };
}
