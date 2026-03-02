import type { HeadlessBrowser } from './browser/Browser';
export type BrowserReplacer = {
    getBrowser: () => HeadlessBrowser;
    replaceBrowser: (make: () => Promise<HeadlessBrowser>, makeNewPages: () => Promise<void>) => Promise<HeadlessBrowser>;
};
export declare const handleBrowserCrash: (instance: HeadlessBrowser, logLevel: "error" | "info" | "trace" | "verbose" | "warn", indent: boolean) => BrowserReplacer;
