import type { TRenderAsset } from 'remotion';
export declare const onlyInlineAudio: ({ assets, fps, timestamp, }: {
    assets: TRenderAsset[];
    fps: number;
    timestamp: number;
}) => AudioData | null;
