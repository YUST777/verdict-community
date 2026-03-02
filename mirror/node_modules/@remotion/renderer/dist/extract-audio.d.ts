export declare const extractAudio: (options: {
    videoSource: string;
    audioOutput: string;
    logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
    binariesDirectory?: string | null | undefined;
}) => Promise<void>;
