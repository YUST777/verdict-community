import type { VideoConfig } from 'remotion/no-react';
import type { RenderMediaOnDownload } from './assets/download-and-map-assets-to-file';
import type { BrowserExecutable } from './browser-executable';
import type { BrowserLog } from './browser-log';
import type { HeadlessBrowser } from './browser/Browser';
import type { OnLog } from './browser/BrowserPage';
import type { StillImageFormat } from './image-format';
import type { CancelSignal } from './make-cancel-signal';
import type { ChromiumOptions } from './open-browser';
import type { ToOptions } from './options/option';
import type { optionsMap } from './options/options-map';
import type { RemotionServer } from './prepare-server';
import type { OnArtifact } from './render-frames';
type InternalRenderStillOptions = {
    composition: VideoConfig;
    output: string | null;
    frame: number;
    serializedInputPropsWithCustomSchema: string;
    serializedResolvedPropsWithCustomSchema: string;
    imageFormat: StillImageFormat;
    jpegQuality: number;
    puppeteerInstance: HeadlessBrowser | null;
    envVariables: Record<string, string>;
    overwrite: boolean;
    browserExecutable: BrowserExecutable;
    onBrowserLog: null | ((log: BrowserLog) => void);
    chromiumOptions: ChromiumOptions;
    scale: number;
    onDownload: RenderMediaOnDownload | null;
    cancelSignal: CancelSignal | null;
    indent: boolean;
    server: RemotionServer | undefined;
    serveUrl: string;
    port: number | null;
    onArtifact: OnArtifact | null;
    onLog: OnLog;
    isProduction: boolean | null;
} & ToOptions<Omit<typeof optionsMap.renderStill, 'apiKey'>>;
export type RenderStillOptions = {
    port?: number | null;
    composition: VideoConfig;
    output?: string | null;
    frame?: number;
    inputProps?: Record<string, unknown>;
    imageFormat?: StillImageFormat;
    puppeteerInstance?: HeadlessBrowser;
    /**
     * @deprecated Use "logLevel": "verbose" instead
     */
    dumpBrowserLogs?: boolean;
    envVariables?: Record<string, string>;
    overwrite?: boolean;
    browserExecutable?: BrowserExecutable;
    onBrowserLog?: (log: BrowserLog) => void;
    chromiumOptions?: ChromiumOptions;
    scale?: number;
    onDownload?: RenderMediaOnDownload;
    cancelSignal?: CancelSignal;
    /**
     * @deprecated Use "logLevel" instead
     */
    verbose?: boolean;
    serveUrl: string;
    /**
     * @deprecated Renamed to `jpegQuality`
     */
    quality?: never;
    onArtifact?: OnArtifact;
    isProduction?: boolean;
} & Partial<ToOptions<typeof optionsMap.renderStill>> & {
    /**
     * @deprecated Use `licenseKey` instead
     */
    apiKey?: string | null;
};
type RenderStillReturnValue = {
    buffer: Buffer | null;
    contentType: string;
};
export declare const internalRenderStill: (options: InternalRenderStillOptions) => Promise<RenderStillReturnValue>;
export declare const renderStill: (options: RenderStillOptions) => Promise<RenderStillReturnValue>;
export {};
