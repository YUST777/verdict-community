import type { LogLevel } from './log-level';
export declare const INDENT_TOKEN: string;
export type LogOptions = {
    indent: boolean;
    logLevel: LogLevel;
};
type VerboseLogOptions = LogOptions & {
    tag?: string;
};
export declare const verboseTag: (str: string) => string;
export declare const secondverboseTag: (str: string) => string;
export declare const Log: {
    formatLogs: (logLevel: "error" | "info" | "trace" | "verbose" | "warn", options: VerboseLogOptions, args: [message?: any, ...optionalParams: any[]]) => string[];
    trace: (options: VerboseLogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
    verbose: (options: VerboseLogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
    info: (options: LogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
    warn: (options: LogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
    error: (options: VerboseLogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
};
export {};
