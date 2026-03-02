import type React from 'react';
import type { RenderType } from './WebRenderModal';
type WebRenderModalAdvancedProps = {
    readonly renderMode: RenderType;
    readonly delayRenderTimeout: number;
    readonly setDelayRenderTimeout: React.Dispatch<React.SetStateAction<number>>;
    readonly mediaCacheSizeInBytes: number | null;
    readonly setMediaCacheSizeInBytes: React.Dispatch<React.SetStateAction<number | null>>;
    readonly hardwareAcceleration: 'no-preference' | 'prefer-hardware' | 'prefer-software';
    readonly setHardwareAcceleration: (value: 'no-preference' | 'prefer-hardware' | 'prefer-software') => void;
};
export declare const WebRenderModalAdvanced: React.FC<WebRenderModalAdvancedProps>;
export {};
