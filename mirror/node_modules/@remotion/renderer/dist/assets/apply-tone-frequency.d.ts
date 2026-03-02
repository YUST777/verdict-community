import type { CancelSignal } from '../make-cancel-signal';
export declare const applyToneFrequencyUsingFfmpeg: ({ input, output, toneFrequency, indent, logLevel, binariesDirectory, cancelSignal, }: {
    input: string;
    output: string;
    toneFrequency: number;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
}) => Promise<void>;
