import type { BrowserExecutable } from './browser-executable';
export declare const getLocalBrowserExecutable: ({ preferredBrowserExecutable, logLevel, indent, chromeMode, }: {
    preferredBrowserExecutable: BrowserExecutable;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    chromeMode: "chrome-for-testing" | "headless-shell";
}) => string;
