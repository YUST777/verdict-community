import type { _InternalTypes } from 'remotion';
import type { VideoConfig } from 'remotion/no-react';
import { NoReactInternals } from 'remotion/no-react';
import { type RenderMediaOnDownload } from './assets/download-and-map-assets-to-file';
import type { Bitrate } from './bitrate';
import type { BrowserExecutable } from './browser-executable';
import type { BrowserLog } from './browser-log';
import type { HeadlessBrowser } from './browser/Browser';
import type { OnLog } from './browser/BrowserPage';
import type { Codec } from './codec';
import type { FfmpegOverrideFn } from './ffmpeg-override';
import type { FrameRange } from './frame-range';
import type { VideoImageFormat } from './image-format';
import type { CancelSignal } from './make-cancel-signal';
import type { ChromiumOptions } from './open-browser';
import { type ColorSpace } from './options/color-space';
import type { ToOptions } from './options/option';
import type { optionsMap } from './options/options-map';
import type { PixelFormat } from './pixel-format';
import type { RemotionServer } from './prepare-server';
import type { OnArtifact } from './render-frames';
import type { OnStartData } from './types';
export type StitchingState = 'encoding' | 'muxing';
export type SlowFrame = {
    frame: number;
    time: number;
};
export type RenderMediaProgress = {
    renderedFrames: number;
    encodedFrames: number;
    encodedDoneIn: number | null;
    renderedDoneIn: number | null;
    renderEstimatedTime: number;
    progress: number;
    stitchStage: StitchingState;
};
export type RenderMediaOnProgress = (progress: RenderMediaProgress) => void;
type MoreRenderMediaOptions = ToOptions<typeof optionsMap.renderMedia>;
type EitherApiKeyOrLicenseKey = true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? {
    licenseKey: string | null;
} : {
    /**
     * @deprecated Use `licenseKey` instead
     */
    apiKey?: string | null;
} | {
    licenseKey?: string | null;
};
export type InternalRenderMediaOptions = {
    outputLocation: string | null;
    composition: Omit<VideoConfig, 'props' | 'defaultProps'>;
    serializedInputPropsWithCustomSchema: string;
    serializedResolvedPropsWithCustomSchema: string;
    crf: number | null;
    imageFormat: VideoImageFormat | null;
    pixelFormat: PixelFormat | null;
    envVariables: Record<string, string>;
    frameRange: FrameRange | null;
    everyNthFrame: number;
    puppeteerInstance: HeadlessBrowser | undefined;
    overwrite: boolean;
    onProgress: RenderMediaOnProgress;
    onDownload: RenderMediaOnDownload;
    proResProfile: _InternalTypes['ProResProfile'] | undefined;
    onBrowserLog: ((log: BrowserLog) => void) | null;
    onStart: (data: OnStartData) => void;
    chromiumOptions: ChromiumOptions;
    scale: number;
    port: number | null;
    cancelSignal: CancelSignal | undefined;
    browserExecutable: BrowserExecutable | null;
    onCtrlCExit: (label: string, fn: () => void) => void;
    indent: boolean;
    server: RemotionServer | undefined;
    preferLossless: boolean;
    enforceAudioTrack: boolean;
    ffmpegOverride: FfmpegOverrideFn | undefined;
    disallowParallelEncoding: boolean;
    serveUrl: string;
    concurrency: number | string | null;
    binariesDirectory: string | null;
    compositionStart: number;
    onArtifact: OnArtifact | null;
    metadata: Record<string, string> | null;
    onLog: OnLog;
    licenseKey: string | null;
    isProduction: boolean | null;
} & MoreRenderMediaOptions;
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type RenderMediaOptions = Prettify<{
    outputLocation?: string | null;
    codec: Codec;
    composition: VideoConfig;
    inputProps?: Record<string, unknown>;
    crf?: number | null;
    imageFormat?: VideoImageFormat;
    pixelFormat?: PixelFormat;
    envVariables?: Record<string, string>;
    /**
     * @deprecated Renamed to `jpegQuality`
     */
    quality?: never;
    jpegQuality?: number;
    frameRange?: FrameRange | null;
    everyNthFrame?: number;
    puppeteerInstance?: HeadlessBrowser;
    overwrite?: boolean;
    onProgress?: RenderMediaOnProgress;
    onDownload?: RenderMediaOnDownload;
    proResProfile?: _InternalTypes['ProResProfile'];
    /**
     * @deprecated Use "logLevel": "verbose" instead
     */
    dumpBrowserLogs?: boolean;
    onBrowserLog?: ((log: BrowserLog) => void) | undefined;
    onStart?: (data: OnStartData) => void;
    chromiumOptions?: ChromiumOptions;
    scale?: number;
    port?: number | null;
    cancelSignal?: CancelSignal;
    browserExecutable?: BrowserExecutable;
    /**
     * @deprecated Use "logLevel" instead
     */
    verbose?: boolean;
    preferLossless?: boolean;
    enforceAudioTrack?: boolean;
    ffmpegOverride?: FfmpegOverrideFn;
    audioBitrate?: Bitrate | null;
    encodingMaxRate?: Bitrate | null;
    encodingBufferSize?: Bitrate | null;
    disallowParallelEncoding?: boolean;
    serveUrl: string;
    concurrency?: number | string | null;
    colorSpace?: ColorSpace;
    repro?: boolean;
    binariesDirectory?: string | null;
    onArtifact?: OnArtifact;
    metadata?: Record<string, string> | null;
    compositionStart?: number;
    isProduction?: boolean;
}> & EitherApiKeyOrLicenseKey & Partial<MoreRenderMediaOptions>;
type RenderMediaResult = {
    buffer: Buffer | null;
    slowestFrames: SlowFrame[];
    contentType: string;
};
export declare const internalRenderMedia: (args_0: InternalRenderMediaOptions) => Promise<RenderMediaResult>;
export declare const renderMedia: ({ proResProfile, x264Preset, crf, composition, inputProps, pixelFormat, codec, envVariables, frameRange, puppeteerInstance, outputLocation, onProgress, overwrite, onDownload, onBrowserLog, onStart, timeoutInMilliseconds, chromiumOptions, scale, browserExecutable, port, cancelSignal, muted, enforceAudioTrack, ffmpegOverride, audioBitrate, videoBitrate, encodingMaxRate, encodingBufferSize, audioCodec, jpegQuality, concurrency, serveUrl, disallowParallelEncoding, everyNthFrame, imageFormat, numberOfGifLoops, dumpBrowserLogs, preferLossless, verbose, quality, logLevel: passedLogLevel, offthreadVideoCacheSizeInBytes, colorSpace, repro, binariesDirectory, separateAudioTo, forSeamlessAacConcatenation, onBrowserDownload, onArtifact, metadata, hardwareAcceleration, chromeMode, offthreadVideoThreads, compositionStart, mediaCacheSizeInBytes, isProduction, ...apiKeyOrLicenseKey }: RenderMediaOptions) => Promise<RenderMediaResult>;
export {};
