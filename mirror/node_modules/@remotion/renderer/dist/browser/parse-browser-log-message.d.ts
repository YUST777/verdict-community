type ParsedBrowserLogMessage = {
    day: number;
    month: number;
    hour: number;
    minute: number;
    seconds: number;
    microseconds: number;
    level: string;
    location: string;
    lineNumber: number;
    message: string;
};
export declare const parseBrowserLogMessage: (input: string) => ParsedBrowserLogMessage | null;
export {};
