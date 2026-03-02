export declare const logLevels: readonly ["trace", "verbose", "info", "warn", "error"];
export type LogLevel = (typeof logLevels)[number];
export declare const isValidLogLevel: (level: string) => boolean;
export declare const isEqualOrBelowLogLevel: (currentLevel: "error" | "info" | "trace" | "verbose" | "warn", level: "error" | "info" | "trace" | "verbose" | "warn") => boolean;
