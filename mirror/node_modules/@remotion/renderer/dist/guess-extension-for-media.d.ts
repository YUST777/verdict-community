import type { CancelSignal } from './make-cancel-signal';
export declare const guessExtensionForVideo: ({ src, indent, logLevel, binariesDirectory, cancelSignal, }: {
    src: string;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
}) => Promise<"mp3" | "mp4" | "wav" | "webm">;
