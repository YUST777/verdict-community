import React from 'react';
import type { ThumbnailMethods } from './player-methods.js';
import type { ErrorFallback, RenderLoading } from './PlayerUI.js';
declare const _default: React.ForwardRefExoticComponent<{
    readonly inputProps: Record<string, unknown>;
    readonly style?: React.CSSProperties | undefined;
    readonly errorFallback: ErrorFallback;
    readonly renderLoading: RenderLoading | undefined;
    readonly className: string | undefined;
    readonly overflowVisible: boolean;
    readonly overrideInternalClassName: string | undefined;
    readonly noSuspense: boolean;
} & React.RefAttributes<ThumbnailMethods>>;
export default _default;
