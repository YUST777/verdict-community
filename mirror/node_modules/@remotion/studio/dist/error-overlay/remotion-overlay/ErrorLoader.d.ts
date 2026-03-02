import React from 'react';
import type { OnRetry } from './ErrorDisplay';
export declare const ErrorLoader: React.FC<{
    readonly error: Error;
    readonly keyboardShortcuts: boolean;
    readonly onRetry: OnRetry;
    readonly canHaveDismissButton: boolean;
    readonly calculateMetadata: boolean;
}>;
