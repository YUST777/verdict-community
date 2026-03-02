import type { BrowserExecutable } from './browser-executable';
import type { OnLog } from './browser/BrowserPage';
import type { ChromiumOptions } from './open-browser';
import type { OnBrowserDownload } from './options/on-browser-download';
type Item = {
    feature: string;
    status: string;
};
export declare const getChromiumGpuInformation: ({ browserExecutable, indent, logLevel, chromiumOptions, timeoutInMilliseconds, onBrowserDownload, chromeMode, onLog, }: {
    browserExecutable: BrowserExecutable;
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    chromiumOptions: ChromiumOptions;
    timeoutInMilliseconds: number;
    onBrowserDownload: OnBrowserDownload;
    chromeMode: "chrome-for-testing" | "headless-shell";
    onLog: OnLog;
}) => Promise<Item[]>;
export {};
