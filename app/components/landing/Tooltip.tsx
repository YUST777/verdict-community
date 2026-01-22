'use client';

import { useState, ReactNode, memo } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-[#1a1a1a] border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#1a1a1a] border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-[#1a1a1a] border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-[#1a1a1a] border-y-transparent border-l-transparent',
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {/* rendering-conditional-render: use ternary, not && */}
            {isVisible ? (
                <div
                    className={`absolute z-[100] pointer-events-none ${positionClasses[position]}`}
                >
                    <div className="relative">
                        {/* Tooltip Box */}
                        <div className="px-3 py-2 bg-[#1a1a1a] text-white text-xs font-medium rounded-lg whitespace-nowrap border border-white/10 shadow-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-amber-400 rounded-full" />
                                {content}
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`} />
                    </div>
                </div>
            ) : null}
        </div>
    );
}

// rerender-memo: wrap with memo to prevent unnecessary re-renders
export default memo(Tooltip);
