import type { AudioOrVideoAsset, InlineAudioAsset, VideoConfig } from 'remotion/no-react';
import type { RenderMediaOnDownload } from './assets/download-and-map-assets-to-file';
import type { BrowserExecutable } from './browser-executable';
import type { BrowserLog } from './browser-log';
import type { HeadlessBrowser } from './browser/Browser';
import type { OnLog } from './browser/BrowserPage';
import type { FrameRange } from './frame-range';
import type { VideoImageFormat } from './image-format';
import type { CancelSignal } from './make-cancel-signal';
import type { ChromiumOptions } from './open-browser';
import type { ToOptions } from './options/option';
import type { optionsMap } from './options/options-map';
import type { RemotionServer } from './prepare-server';
import type { EmittedArtifact } from './serialize-artifact';
import type { OnStartData, RenderFramesOutput } from './types';
export type OnArtifact = (asset: EmittedArtifact) => void;
type InternalRenderFramesOptions = {
    onStart: null | ((data: OnStartData) => void);
    onFrameUpdate: null | ((framesRendered: number, frameIndex: number, timeToRenderInMilliseconds: number) => void);
    outputDir: string | null;
    envVariables: Record<string, string>;
    imageFormat: VideoImageFormat;
    jpegQuality: number;
    frameRange: FrameRange | null;
    everyNthFrame: number;
    puppeteerInstance: HeadlessBrowser | undefined;
    browserExecutable: BrowserExecutable | null;
    onBrowserLog: null | ((log: BrowserLog) => void);
    onFrameBuffer: null | ((buffer: Buffer, frame: number) => void);
    onDownload: RenderMediaOnDownload | null;
    chromiumOptions: ChromiumOptions;
    scale: number;
    port: number | null;
    cancelSignal: CancelSignal | undefined;
    composition: Omit<VideoConfig, 'props' | 'defaultProps'>;
    indent: boolean;
    server: RemotionServer | undefined;
    muted: boolean;
    concurrency: number | string | null;
    webpackBundleOrServeUrl: string;
    serializedInputPropsWithCustomSchema: string;
    serializedResolvedPropsWithCustomSchema: string;
    parallelEncodingEnabled: boolean;
    compositionStart: number;
    onArtifact: OnArtifact | null;
    onLog: OnLog;
} & ToOptions<typeof optionsMap.renderFrames>;
type ArtifactWithoutContent = {
    frame: number;
    filename: string;
};
export type FrameAndAssets = {
    frame: number;
    audioAndVideoAssets: AudioOrVideoAsset[];
    artifactAssets: ArtifactWithoutContent[];
    inlineAudioAssets: InlineAudioAsset[];
};
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type RenderFramesOptions = Prettify<{
    onStart: (data: OnStartData) => void;
    onFrameUpdate: (framesRendered: number, frameIndex: number, timeToRenderInMilliseconds: number) => void;
    outputDir: string | null;
    inputProps: Record<string, unknown>;
    envVariables?: Record<string, string>;
    imageFormat?: VideoImageFormat;
    /**
     * @deprecated Renamed to "jpegQuality"
     */
    quality?: never;
    frameRange?: FrameRange | null;
    everyNthFrame?: number;
    /**
     * @deprecated Use "logLevel": "verbose" instead
     */
    dumpBrowserLogs?: boolean;
    /**
     * @deprecated Use "logLevel" instead
     */
    verbose?: boolean;
    puppeteerInstance?: HeadlessBrowser;
    browserExecutable?: BrowserExecutable;
    onBrowserLog?: (log: BrowserLog) => void;
    onFrameBuffer?: (buffer: Buffer, frame: number) => void;
    onDownload?: RenderMediaOnDownload;
    timeoutInMilliseconds?: number;
    chromiumOptions?: ChromiumOptions;
    scale?: number;
    port?: number | null;
    cancelSignal?: CancelSignal;
    composition: VideoConfig;
    muted?: boolean;
    concurrency?: number | string | null;
    onArtifact?: OnArtifact | null;
    serveUrl: string;
} & Partial<ToOptions<typeof optionsMap.renderFrames>>>;
export declare const internalRenderFrames: (args_0: InternalRenderFramesOptions) => Promise<RenderFramesOutput>;
export declare const renderFrames: (options: {
    readonly mediaCacheSizeInBytes?: number | null | undefined;
    readonly forSeamlessAacConcatenation?: boolean | undefined;
    readonly offthreadVideoCacheSizeInBytes?: number | null | undefined;
    readonly offthreadVideoThreads?: number | null | undefined;
    readonly jpegQuality?: number | undefined;
    readonly logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
    readonly binariesDirectory?: string | null | undefined;
    readonly onBrowserDownload?: import(".").OnBrowserDownload | undefined;
    readonly chromeMode?: "chrome-for-testing" | "headless-shell" | undefined;
    readonly imageSequencePattern?: string | null | undefined;
    onStart: (data: OnStartData) => void;
    onFrameUpdate: (framesRendered: number, frameIndex: number, timeToRenderInMilliseconds: number) => void;
    outputDir: string | null;
    inputProps: Record<string, unknown>;
    envVariables?: Record<string, string> | undefined;
    imageFormat?: "jpeg" | "none" | "png" | undefined;
    quality?: undefined;
    frameRange?: FrameRange | null | undefined;
    everyNthFrame?: number | undefined;
    dumpBrowserLogs?: boolean | undefined;
    verbose?: boolean | undefined;
    puppeteerInstance?: HeadlessBrowser | undefined;
    browserExecutable?: BrowserExecutable | undefined;
    onBrowserLog?: ((log: BrowserLog) => void) | undefined;
    onFrameBuffer?: ((buffer: Buffer, frame: number) => void) | undefined;
    onDownload?: RenderMediaOnDownload | undefined;
    timeoutInMilliseconds?: number | undefined;
    chromiumOptions?: ChromiumOptions | undefined;
    scale?: number | undefined;
    port?: number | null | undefined;
    cancelSignal?: CancelSignal | undefined;
    composition: VideoConfig;
    muted?: boolean | undefined;
    concurrency?: string | number | null | undefined;
    onArtifact?: OnArtifact | null | undefined;
    serveUrl: string;
}) => Promise<RenderFramesOutput>;
export {};
