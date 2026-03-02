import type { AssetVolume, MediaAsset } from './assets/types';
export type FilterWithoutPaddingApplied = ProcessedTrack & {
    filter: string | null;
    actualTrimLeft: number;
};
export type ProcessedTrack = {
    pad_start: string | null;
    pad_end: string | null;
};
export declare const stringifyFfmpegFilter: ({ channels, volume, fps, assetDuration, chunkLengthInSeconds, forSeamlessAacConcatenation, trimLeftOffset, trimRightOffset, asset, indent, logLevel, presentationTimeOffsetInSeconds, }: {
    channels: number;
    volume: AssetVolume;
    fps: number;
    assetDuration: number | null;
    chunkLengthInSeconds: number;
    forSeamlessAacConcatenation: boolean;
    trimLeftOffset: number;
    trimRightOffset: number;
    asset: MediaAsset;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    presentationTimeOffsetInSeconds: number;
}) => FilterWithoutPaddingApplied | null;
