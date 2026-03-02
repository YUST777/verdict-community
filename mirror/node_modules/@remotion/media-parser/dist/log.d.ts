export declare const logLevels: readonly ["trace", "verbose", "info", "warn", "error"];
export type MediaParserLogLevel = (typeof logLevels)[number];
export declare const isEqualOrBelowLogLevel: (currentLevel: MediaParserLogLevel, level: MediaParserLogLevel) => boolean;
export declare const Log: {
    trace: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
    verbose: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
    info: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
    warn: (logLevel: MediaParserLogLevel, message?: any, ...optionalParams: any[]) => void;
    error: (message?: any, ...optionalParams: any[]) => void;
};
