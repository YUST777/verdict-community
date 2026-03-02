import type { CancelSignal } from './make-cancel-signal';
export declare const compressAudio: ({ audioCodec, outName, binariesDirectory, indent, logLevel, audioBitrate, cancelSignal, inName, onProgress, chunkLengthInSeconds, fps, }: {
    audioCodec: "aac" | "mp3" | "opus" | "pcm-16";
    outName: string;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    audioBitrate: string | null;
    cancelSignal: CancelSignal | undefined;
    inName: string;
    onProgress: (progress: number) => void;
    chunkLengthInSeconds: number;
    fps: number;
}) => Promise<void>;
