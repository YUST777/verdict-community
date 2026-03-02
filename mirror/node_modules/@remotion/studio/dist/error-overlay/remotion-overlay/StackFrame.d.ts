import type { SymbolicatedStackFrame } from '@remotion/studio-shared';
import React from 'react';
export declare const StackElement: React.FC<{
    readonly s: SymbolicatedStackFrame;
    readonly lineNumberWidth: number;
    readonly isFirst: boolean;
    readonly defaultFunctionName: string;
}>;
