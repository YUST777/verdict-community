import React from 'react';
type HighestZIndexContainer = {
    highestIndex: number;
    registerZIndex: (index: number) => void;
    unregisterZIndex: (index: number) => void;
};
export declare const HighestZIndexContext: React.Context<HighestZIndexContainer>;
export declare const HighestZIndexProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};
