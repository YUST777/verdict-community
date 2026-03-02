import type { RecastCodemod } from '@remotion/studio-shared';
import React from 'react';
export declare const CodemodFooter: React.FC<{
    readonly valid: boolean;
    readonly codemod: RecastCodemod;
    readonly loadingNotification: React.ReactNode;
    readonly successNotification: React.ReactNode;
    readonly errorNotification: string;
    readonly genericSubmitLabel: string;
    readonly submitLabel: (options: {
        relativeRootPath: string;
    }) => string;
    readonly onSuccess: (() => void) | null;
}>;
