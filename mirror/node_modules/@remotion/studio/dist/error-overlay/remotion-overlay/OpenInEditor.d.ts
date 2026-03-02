import type { SymbolicatedStackFrame } from '@remotion/studio-shared';
import React from 'react';
export declare const OpenInEditor: React.FC<{
    readonly stack: SymbolicatedStackFrame;
    readonly canHaveKeyboardShortcuts: boolean;
}>;
