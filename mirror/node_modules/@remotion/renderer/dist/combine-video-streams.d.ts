import type { CancelSignal } from './make-cancel-signal';
export declare const combineVideoStreams: ({ fps, codec, filelistDir, numberOfGifLoops, output, indent, logLevel, onProgress, files, addRemotionMetadata, binariesDirectory, cancelSignal, }: {
    fps: number;
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    filelistDir: string;
    numberOfGifLoops: number | null;
    output: string;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    onProgress: (p: number) => void;
    files: string[];
    addRemotionMetadata: boolean;
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
}) => Promise<string>;
