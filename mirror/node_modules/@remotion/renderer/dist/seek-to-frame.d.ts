import type { Page } from './browser/BrowserPage';
export declare const waitForReady: ({ page, timeoutInMilliseconds, frame, indent, logLevel, }: {
    page: Page;
    timeoutInMilliseconds: number;
    frame: number | null;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
}) => Promise<unknown>;
export declare const seekToFrame: ({ frame, page, composition, timeoutInMilliseconds, logLevel, indent, attempt, }: {
    frame: number;
    composition: string;
    page: Page;
    timeoutInMilliseconds: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    attempt: number;
}) => Promise<void>;
