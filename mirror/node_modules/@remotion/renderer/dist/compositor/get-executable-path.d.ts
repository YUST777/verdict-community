import type { LogLevel } from '../log-level';
export declare function isMusl({ indent, logLevel }: {
    indent: boolean;
    logLevel: LogLevel;
}): boolean;
export declare const getExecutablePath: ({ indent, logLevel, type, binariesDirectory, }: {
    type: "compositor" | "ffmpeg" | "ffprobe";
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    binariesDirectory: string | null;
}) => string;
export declare const getExecutableDir: (indent: boolean, logLevel: "error" | "info" | "trace" | "verbose" | "warn") => string;
