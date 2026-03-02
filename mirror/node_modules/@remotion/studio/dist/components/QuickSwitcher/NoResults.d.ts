import React from 'react';
export type QuickSwitcherMode = 'commands' | 'compositions' | 'docs';
export declare const QuickSwitcherNoResults: React.FC<{
    readonly query: string;
    readonly mode: QuickSwitcherMode;
}>;
