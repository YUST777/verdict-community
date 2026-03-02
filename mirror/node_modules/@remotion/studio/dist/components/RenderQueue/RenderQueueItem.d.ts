import React from 'react';
import type { AnyRenderJob } from './context';
export declare const RenderQueueItem: React.FC<{
    readonly job: AnyRenderJob;
    readonly selected: boolean;
}>;
