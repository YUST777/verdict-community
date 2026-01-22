import { useState, useRef, useEffect, useCallback } from 'react';

interface UseWhiteboardResizeReturn {
    whiteboardHeight: number;
    isResizingWhiteboard: boolean;
    handleResizeStart: (e: React.MouseEvent) => void;
}

export function useWhiteboardResize(): UseWhiteboardResizeReturn {
    const [whiteboardHeight, setWhiteboardHeight] = useState(400);
    const [isResizingWhiteboard, setIsResizingWhiteboard] = useState(false);
    const whiteboardStartY = useRef(0);
    const whiteboardStartHeight = useRef(0);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingWhiteboard(true);
        whiteboardStartY.current = e.clientY;
        whiteboardStartHeight.current = whiteboardHeight;
    }, [whiteboardHeight]);

    // Apply cursor styles when resizing starts
    useEffect(() => {
        if (isResizingWhiteboard) {
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }
    }, [isResizingWhiteboard]);

    useEffect(() => {
        if (!isResizingWhiteboard) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = whiteboardStartY.current - e.clientY; // Dragging up increases height
            // Limit height between 100px and 80% of window height
            const maxHeight = window.innerHeight * 0.8;
            const newHeight = Math.max(100, Math.min(maxHeight, whiteboardStartHeight.current + deltaY));
            setWhiteboardHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsResizingWhiteboard(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingWhiteboard]);

    return {
        whiteboardHeight,
        isResizingWhiteboard,
        handleResizeStart
    };
}

