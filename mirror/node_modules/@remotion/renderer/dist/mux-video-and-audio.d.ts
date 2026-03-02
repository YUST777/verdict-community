import type { CancelSignal } from './make-cancel-signal';
export declare const muxVideoAndAudio: ({ videoOutput, audioOutput, output, indent, logLevel, onProgress, binariesDirectory, fps, cancelSignal, addFaststart, metadata, numberOfGifLoops, }: {
    videoOutput: string | null;
    audioOutput: string | null;
    output: string;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    fps: number;
    onProgress: (p: number) => void;
    cancelSignal: CancelSignal | undefined;
    addFaststart: boolean;
    metadata?: Record<string, string> | null | undefined;
    numberOfGifLoops: number | null;
}) => Promise<void>;
