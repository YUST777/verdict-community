import type { CancelSignal } from './make-cancel-signal';
export declare const durationOf1Frame: number;
export declare const getClosestAlignedTime: (targetTime: number) => number;
export declare const createCombinedAudio: ({ seamless, filelistDir, files, indent, logLevel, audioBitrate, resolvedAudioCodec, output, chunkDurationInSeconds, addRemotionMetadata, binariesDirectory, fps, cancelSignal, onProgress, }: {
    seamless: boolean;
    filelistDir: string;
    files: string[];
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    audioBitrate: string | null;
    resolvedAudioCodec: "aac" | "mp3" | "opus" | "pcm-16";
    output: string;
    chunkDurationInSeconds: number;
    addRemotionMetadata: boolean;
    binariesDirectory: string | null;
    fps: number;
    cancelSignal: CancelSignal | undefined;
    onProgress: (frames: number) => void;
}) => Promise<string>;
