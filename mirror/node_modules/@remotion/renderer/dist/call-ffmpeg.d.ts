import type { SpawnOptionsWithoutStdio } from 'node:child_process';
import execa from 'execa';
import type { CancelSignal } from './make-cancel-signal';
export declare const callFf: ({ args, bin, indent, logLevel, options, binariesDirectory, cancelSignal, }: {
    bin: "ffmpeg" | "ffprobe";
    args: (string | null)[];
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
    options?: execa.Options<string> | undefined;
}) => execa.ExecaChildProcess<string>;
export declare const callFfNative: ({ args, bin, indent, logLevel, options, binariesDirectory, cancelSignal, }: {
    bin: "ffmpeg" | "ffprobe";
    args: (string | null)[];
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
    cancelSignal: CancelSignal | undefined;
    options?: SpawnOptionsWithoutStdio | undefined;
}) => import("child_process").ChildProcessWithoutNullStreams;
