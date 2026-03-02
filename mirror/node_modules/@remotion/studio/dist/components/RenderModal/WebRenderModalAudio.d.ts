import type { WebRendererAudioCodec, WebRendererContainer, WebRendererQuality } from '@remotion/web-renderer';
import React from 'react';
export declare const WebRenderModalAudio: React.FC<{
    readonly muted: boolean;
    readonly setMuted: React.Dispatch<React.SetStateAction<boolean>>;
    readonly audioCodec: WebRendererAudioCodec;
    readonly setAudioCodec: React.Dispatch<React.SetStateAction<WebRendererAudioCodec>>;
    readonly audioBitrate: WebRendererQuality;
    readonly setAudioBitrate: React.Dispatch<React.SetStateAction<WebRendererQuality>>;
    readonly container: WebRendererContainer;
    readonly encodableCodecs: WebRendererAudioCodec[];
    readonly effectiveAudioCodec: WebRendererAudioCodec;
}>;
