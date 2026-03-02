import type { VideoConfig } from 'remotion/no-react';
import type { BrowserExecutable } from './browser-executable';
import type { BrowserLog } from './browser-log';
import type { HeadlessBrowser } from './browser/Browser';
import type { ChromiumOptions } from './open-browser';
import type { ToOptions } from './options/option';
import type { optionsMap } from './options/options-map';
import type { RemotionServer } from './prepare-server';
import type { RequiredInputPropsInV5 } from './v5-required-input-props';
type InternalSelectCompositionsConfig = {
    serializedInputPropsWithCustomSchema: string;
    envVariables: Record<string, string>;
    puppeteerInstance: HeadlessBrowser | undefined;
    onBrowserLog: null | ((log: BrowserLog) => void);
    browserExecutable: BrowserExecutable | null;
    chromiumOptions: ChromiumOptions;
    port: number | null;
    indent: boolean;
    server: RemotionServer | undefined;
    serveUrl: string;
    id: string;
    onServeUrlVisited: () => void;
} & ToOptions<typeof optionsMap.selectComposition>;
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type SelectCompositionOptions = Prettify<RequiredInputPropsInV5 & {
    envVariables?: Record<string, string>;
    puppeteerInstance?: HeadlessBrowser;
    onBrowserLog?: (log: BrowserLog) => void;
    browserExecutable?: BrowserExecutable;
    chromiumOptions?: ChromiumOptions;
    port?: number | null;
    /**
     * @deprecated Use `logLevel` instead.
     */
    verbose?: boolean;
    serveUrl: string;
    id: string;
} & Partial<ToOptions<typeof optionsMap.selectComposition>>>;
type InternalReturnType = {
    metadata: VideoConfig;
    propsSize: number;
};
export declare const internalSelectCompositionRaw: (options: InternalSelectCompositionsConfig) => Promise<InternalReturnType>;
export declare const internalSelectComposition: (options: InternalSelectCompositionsConfig) => Promise<InternalReturnType>;
export declare const selectComposition: (options: {
    readonly mediaCacheSizeInBytes?: number | null | undefined;
    readonly offthreadVideoCacheSizeInBytes?: number | null | undefined;
    readonly offthreadVideoThreads?: number | null | undefined;
    readonly logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
    readonly timeoutInMilliseconds?: number | undefined;
    readonly binariesDirectory?: string | null | undefined;
    readonly onBrowserDownload?: import(".").OnBrowserDownload | undefined;
    readonly chromeMode?: "chrome-for-testing" | "headless-shell" | undefined;
    inputProps?: Record<string, unknown> | undefined;
    envVariables?: Record<string, string> | undefined;
    puppeteerInstance?: HeadlessBrowser | undefined;
    onBrowserLog?: ((log: BrowserLog) => void) | undefined;
    browserExecutable?: BrowserExecutable | undefined;
    chromiumOptions?: ChromiumOptions | undefined;
    port?: number | null | undefined;
    verbose?: boolean | undefined;
    serveUrl: string;
    id: string;
}) => Promise<VideoConfig>;
export {};
