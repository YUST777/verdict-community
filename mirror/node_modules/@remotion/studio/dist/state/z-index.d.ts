import React from 'react';
export declare const HigherZIndex: React.FC<{
    readonly onEscape: () => void;
    readonly onOutsideClick: (target: Node) => void;
    readonly children: React.ReactNode;
    readonly disabled?: boolean;
}>;
export declare const useZIndex: () => {
    currentZIndex: number;
    highestZIndex: number;
    isHighestContext: boolean;
    tabIndex: number;
};
