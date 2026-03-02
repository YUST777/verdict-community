import React from 'react';
import type { _InternalTypes, VideoConfig } from 'remotion';
type TResolvedCompositionContext = {
    unresolved: _InternalTypes['AnyComposition'];
    resolved: {
        type: 'success';
        result: VideoConfig;
    };
} | null;
export declare const ResolvedCompositionContext: React.Context<TResolvedCompositionContext>;
export declare const ResolveCompositionBeforeModal: React.FC<{
    readonly compositionId: string;
    readonly children: React.ReactNode;
}>;
export {};
