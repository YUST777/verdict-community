import type { WebRendererQuality } from '@remotion/web-renderer';
import type React from 'react';
import type { RenderType } from './WebRenderModal';
type WebRenderModalPictureProps = {
    readonly renderMode: RenderType;
    readonly videoBitrate: WebRendererQuality;
    readonly setVideoBitrate: (quality: WebRendererQuality) => void;
    readonly keyframeIntervalInSeconds: number;
    readonly setKeyframeIntervalInSeconds: React.Dispatch<React.SetStateAction<number>>;
    readonly transparent: boolean;
    readonly setTransparent: React.Dispatch<React.SetStateAction<boolean>>;
    readonly scale: number;
    readonly setScale: React.Dispatch<React.SetStateAction<number>>;
    readonly compositionWidth: number;
    readonly compositionHeight: number;
};
export declare const WebRenderModalPicture: React.FC<WebRenderModalPictureProps>;
export {};
