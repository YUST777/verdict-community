import type { BrowserExecutable } from './browser-executable';
import type { BrowserSafeApis } from './client';
import type { ChromeMode } from './options/chrome-mode';
import type { ToOptions } from './options/option';
export type BrowserStatus = {
    type: 'user-defined-path';
    path: string;
} | {
    type: 'local-puppeteer-browser';
    path: string;
} | {
    type: 'no-browser';
} | {
    type: 'version-mismatch';
    actualVersion: string | null;
};
type InternalEnsureBrowserOptions = {
    browserExecutable: BrowserExecutable;
    indent: boolean;
    chromeMode: ChromeMode;
} & ToOptions<typeof BrowserSafeApis.optionsMap.ensureBrowser>;
export type EnsureBrowserOptions = Partial<{
    browserExecutable: BrowserExecutable;
} & ToOptions<typeof BrowserSafeApis.optionsMap.ensureBrowser>>;
export declare const internalEnsureBrowser: (options: InternalEnsureBrowserOptions) => Promise<BrowserStatus>;
export declare const ensureBrowser: (options?: Partial<{
    browserExecutable: BrowserExecutable;
} & ToOptions<{
    readonly logLevel: {
        cliFlag: "log";
        name: string;
        ssrName: string;
        description: () => import("react/jsx-runtime").JSX.Element;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: "error" | "info" | "trace" | "verbose" | "warn";
            source: string;
        };
        setConfig: (newLogLevel: "error" | "info" | "trace" | "verbose" | "warn") => void;
        type: "error" | "info" | "trace" | "verbose" | "warn";
        id: "log";
    };
    readonly onBrowserDownload: {
        name: string;
        cliFlag: "on-browser-download";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "onBrowserDownload";
        docLink: string;
        type: import(".").OnBrowserDownload;
        getValue: () => never;
        setConfig: () => never;
        id: "on-browser-download";
    };
    readonly chromeMode: {
        cliFlag: "chrome-mode";
        name: string;
        ssrName: string;
        description: () => import("react/jsx-runtime").JSX.Element;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: "chrome-for-testing" | "headless-shell";
            source: string;
        };
        setConfig: (newChromeMode: "chrome-for-testing" | "headless-shell") => void;
        type: "chrome-for-testing" | "headless-shell";
        id: "chrome-mode";
    };
}>> | undefined) => Promise<BrowserStatus>;
export {};
