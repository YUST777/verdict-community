import React from 'react';
import type { ErrorRecord } from '../react-overlay/listen-to-runtime-errors';
export type OnRetry = null | (() => void);
export declare const ErrorDisplay: React.FC<{
    readonly display: ErrorRecord;
    readonly keyboardShortcuts: boolean;
    readonly onRetry: OnRetry;
    readonly canHaveDismissButton: boolean;
    readonly calculateMetadata: boolean;
}>;
