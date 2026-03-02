import type { MediaParserLogLevel } from '@remotion/media-parser';
declare const Log: {
    trace: (logLevel: "error" | "info" | "trace" | "verbose" | "warn", message?: any, ...optionalParams: any[]) => void;
    verbose: (logLevel: "error" | "info" | "trace" | "verbose" | "warn", message?: any, ...optionalParams: any[]) => void;
    info: (logLevel: "error" | "info" | "trace" | "verbose" | "warn", message?: any, ...optionalParams: any[]) => void;
    warn: (logLevel: "error" | "info" | "trace" | "verbose" | "warn", message?: any, ...optionalParams: any[]) => void;
    error: (message?: any, ...optionalParams: any[]) => void;
};
export { Log };
export type { MediaParserLogLevel as LogLevel };
