import React from 'react';
import type { QuickSwitcherMode } from './NoResults';
declare const QuickSwitcher: React.FC<{
    readonly initialMode: QuickSwitcherMode;
    readonly invocationTimestamp: number;
    readonly readOnlyStudio: boolean;
}>;
export default QuickSwitcher;
