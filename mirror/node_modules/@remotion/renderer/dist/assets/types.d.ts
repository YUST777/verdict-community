import type { AudioOrVideoAsset } from 'remotion/no-react';
export type UnsafeAsset = Omit<AudioOrVideoAsset, 'frame' | 'id' | 'volume' | 'mediaFrame' | 'audioStartFrom'> & {
    startInVideo: number;
    duration: number | null;
    trimLeft: number;
    volume: number[];
    id: string;
    playbackRate: number;
    toneFrequency: number;
    audioStreamIndex: number;
};
export type AssetVolume = number | number[];
export type MediaAsset = Omit<UnsafeAsset, 'duration' | 'volume'> & {
    duration: number;
    volume: AssetVolume;
};
export declare const uncompressMediaAsset: (allRenderAssets: AudioOrVideoAsset[], assetToUncompress: AudioOrVideoAsset) => AudioOrVideoAsset;
export type Assets = MediaAsset[];
