import type { Codec } from './codec';
import type { FrameRange } from './frame-range';
import type { LogLevel } from './log-level';
import type { CancelSignal } from './make-cancel-signal';
import type { AudioCodec } from './options/audio-codec';
type MandatoryCombineChunksOptions = {
    outputLocation: string;
    audioFiles: string[];
    codec: Codec;
    videoFiles: string[];
    fps: number;
    framesPerChunk: number;
    preferLossless: boolean;
    compositionDurationInFrames: number;
};
type CombineChunksProgress = {
    totalProgress: number;
    frames: number;
};
export type CombineChunksOnProgress = (options: CombineChunksProgress) => void;
type OptionalCombineChunksOptions = {
    onProgress: CombineChunksOnProgress;
    audioBitrate: string | null;
    numberOfGifLoops: number | null;
    logLevel: LogLevel;
    binariesDirectory: string | null;
    audioCodec: AudioCodec | null;
    cancelSignal: CancelSignal | undefined;
    metadata: Record<string, string> | null;
    frameRange: FrameRange | null;
    everyNthFrame: number;
};
export type CombineChunksOptions = MandatoryCombineChunksOptions & Partial<OptionalCombineChunksOptions>;
export declare const internalCombineChunks: ({ outputLocation: output, onProgress, codec, fps, numberOfGifLoops, audioBitrate, indent, logLevel, binariesDirectory, cancelSignal, metadata, audioFiles, videoFiles, framesPerChunk, audioCodec, preferLossless, everyNthFrame, frameRange, compositionDurationInFrames, }: MandatoryCombineChunksOptions & OptionalCombineChunksOptions & {
    indent: boolean;
}) => Promise<void>;
export declare const combineChunks: (options: CombineChunksOptions) => Promise<void>;
export {};
