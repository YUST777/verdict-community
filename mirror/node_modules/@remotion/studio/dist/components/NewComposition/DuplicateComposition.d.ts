import React from 'react';
export type CompType = 'composition' | 'still';
export declare const DuplicateComposition: React.FC<{
    readonly compositionId: string;
    readonly compositionType: CompType;
}>;
