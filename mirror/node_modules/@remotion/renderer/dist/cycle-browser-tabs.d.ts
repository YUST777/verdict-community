import type { BrowserReplacer } from './replace-browser';
export declare const cycleBrowserTabs: ({ puppeteerInstance, concurrency, logLevel, indent, }: {
    puppeteerInstance: BrowserReplacer;
    concurrency: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
}) => {
    stopCycling: () => void;
};
