import type { ScriptLine } from '@remotion/studio-shared';
import React from 'react';
export declare const CodeFrame: React.FC<{
    readonly source: ScriptLine[];
    readonly lineNumberWidth: number;
}>;
