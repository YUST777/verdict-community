import type { SamplePosition } from '@remotion/media-parser';
export declare const createStbl: ({ samplePositions, codecSpecificData, isVideo, }: {
    samplePositions: SamplePosition[];
    codecSpecificData: Uint8Array<ArrayBufferLike>;
    isVideo: boolean;
}) => Uint8Array<ArrayBufferLike>;
