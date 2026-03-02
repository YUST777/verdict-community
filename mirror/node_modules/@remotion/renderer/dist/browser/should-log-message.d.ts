export declare const shouldLogBrowserMessage: (message: string) => boolean;
export declare const formatChromeMessage: (input: string) => {
    output: string;
    tag: string;
} | null;
type ChromeLogLocation = {
    location: string;
    lineNumber: number;
};
export declare const parseChromeLogLocation: (message: string) => ChromeLogLocation | null;
export {};
