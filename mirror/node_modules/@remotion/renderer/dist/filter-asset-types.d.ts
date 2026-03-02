import type { AudioOrVideoAsset, InlineAudioAsset, TRenderAsset } from 'remotion/no-react';
import type { EmittedArtifact } from './serialize-artifact';
export declare const onlyAudioAndVideoAssets: (assets: TRenderAsset[]) => AudioOrVideoAsset[];
export declare const onlyArtifact: ({ assets, frameBuffer, }: {
    assets: TRenderAsset[];
    frameBuffer: Buffer | null;
}) => EmittedArtifact[];
export declare const onlyInlineAudio: (assets: TRenderAsset[]) => InlineAudioAsset[];
