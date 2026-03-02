import type { NoReactInternals } from 'remotion/no-react';
import type { Browser } from './browser';
import type { HeadlessBrowser } from './browser/Browser';
import type { Viewport } from './browser/PuppeteerViewport';
import { type LogLevel } from './log-level';
import type { ChromeMode } from './options/chrome-mode';
import type { validOpenGlRenderers } from './options/gl';
import type { ToOptions } from './options/option';
import type { optionsMap } from './options/options-map';
type OpenGlRenderer = (typeof validOpenGlRenderers)[number];
type OnlyV4Options = typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES extends true ? {} : {
    /**
     * @deprecated - Will be removed in v5.
     * Chrome Headless shell does not allow disabling headless mode anymore.
     */
    headless?: boolean;
};
export type ChromiumOptions = {
    ignoreCertificateErrors?: boolean;
    disableWebSecurity?: boolean;
    gl?: OpenGlRenderer | null;
    userAgent?: string | null;
    enableMultiProcessOnLinux?: boolean;
    darkMode?: boolean;
} & OnlyV4Options;
type InternalOpenBrowserOptions = {
    browserExecutable: string | null;
    chromiumOptions: ChromiumOptions;
    forceDeviceScaleFactor: number | undefined;
    viewport: Viewport | null;
    indent: boolean;
    browser: Browser;
} & ToOptions<typeof optionsMap.openBrowser>;
type LogOptions = typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES extends true ? {
    logLevel?: LogLevel;
} : {
    shouldDumpIo?: boolean;
    logLevel?: LogLevel;
};
export type OpenBrowserOptions = {
    browserExecutable?: string | null;
    chromiumOptions?: ChromiumOptions;
    chromeMode?: ChromeMode;
    forceDeviceScaleFactor?: number;
} & LogOptions;
export declare const internalOpenBrowser: ({ browser, browserExecutable, chromiumOptions, forceDeviceScaleFactor, indent, viewport, logLevel, onBrowserDownload, chromeMode, }: InternalOpenBrowserOptions) => Promise<HeadlessBrowser>;
export declare const openBrowser: (browser: "chrome", options?: OpenBrowserOptions | undefined) => Promise<HeadlessBrowser>;
export {};
