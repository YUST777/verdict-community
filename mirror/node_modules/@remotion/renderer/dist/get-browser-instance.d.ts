import type { BrowserExecutable } from './browser-executable';
import type { BrowserLog } from './browser-log';
import type { HeadlessBrowser } from './browser/Browser';
import type { OnLog, Page } from './browser/BrowserPage';
import type { ChromiumOptions } from './open-browser';
import type { OnBrowserDownload } from './options/on-browser-download';
export declare const getPageAndCleanupFn: ({ passedInInstance, browserExecutable, chromiumOptions, forceDeviceScaleFactor, indent, logLevel, onBrowserDownload, chromeMode, pageIndex, onBrowserLog, onLog, }: {
    passedInInstance: HeadlessBrowser | undefined;
    browserExecutable: BrowserExecutable;
    chromiumOptions: ChromiumOptions;
    indent: boolean;
    forceDeviceScaleFactor: number | undefined;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    onBrowserDownload: OnBrowserDownload;
    chromeMode: "chrome-for-testing" | "headless-shell";
    pageIndex: number;
    onBrowserLog: ((log: BrowserLog) => void) | null;
    onLog: OnLog;
}) => Promise<{
    cleanupPage: () => Promise<void>;
    page: Page;
}>;
