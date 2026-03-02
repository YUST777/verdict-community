import execa from 'execa';
import { HeadlessBrowser } from './browser/Browser';
import { SymbolicateableError } from './error-handling/symbolicateable-error';
import { mimeContentType, mimeLookup } from './mime-types';
import * as perf from './perf';
export type { RenderMediaOnDownload } from './assets/download-and-map-assets-to-file';
export type { Bitrate } from './bitrate';
export { Browser } from './browser';
export { BrowserExecutable } from './browser-executable';
export { BrowserLog } from './browser-log';
export type { HeadlessBrowser } from './browser/Browser';
export type { OnLog } from './browser/BrowserPage';
export { Codec, CodecOrUndefined } from './codec';
export { CombineChunksOnProgress, CombineChunksOptions, combineChunks, } from './combine-chunks';
export { Crf } from './crf';
export { EnsureBrowserOptions, ensureBrowser } from './ensure-browser';
export { ErrorWithStackFrame } from './error-handling/handle-javascript-exception';
export { extractAudio } from './extract-audio';
export type { FfmpegOverrideFn } from './ffmpeg-override';
export { FileExtension } from './file-extensions';
export { FrameRange } from './frame-range';
export { GetCompositionsOptions, getCompositions } from './get-compositions';
export { SilentPart, getSilentParts } from './get-silent-parts';
export { VideoMetadata, getVideoMetadata } from './get-video-metadata';
export { ImageFormat, StillImageFormat, VideoImageFormat, validateSelectedPixelFormatAndImageFormatCombination, } from './image-format';
export type { LogLevel } from './log-level';
export { LogOptions } from './logger';
export { CancelSignal, makeCancelSignal } from './make-cancel-signal';
export { openBrowser } from './open-browser';
export type { ChromiumOptions } from './open-browser';
export { ChromeMode } from './options/chrome-mode';
export { ColorSpace } from './options/color-space';
export type { Concurrency } from './options/concurrency';
export type { DeleteAfter } from './options/delete-after';
export { OpenGlRenderer } from './options/gl';
export { NumberOfGifLoops } from './options/number-of-gif-loops';
export { DownloadBrowserProgressFn, OnBrowserDownload, } from './options/on-browser-download';
export { AnyRemotionOption, RemotionOption, ToOptions } from './options/option';
export { X264Preset } from './options/x264-preset';
export { PixelFormat } from './pixel-format';
export { RemotionServer } from './prepare-server';
export { OnArtifact, RenderFramesOptions, renderFrames } from './render-frames';
export { InternalRenderMediaOptions, RenderMediaOnProgress, RenderMediaOptions, RenderMediaProgress, SlowFrame, StitchingState, renderMedia, } from './render-media';
export { RenderStillOptions, renderStill } from './render-still';
export { SelectCompositionOptions, selectComposition, } from './select-composition';
export { EmittedArtifact } from './serialize-artifact';
export { StitchFramesToVideoOptions, stitchFramesToVideo, } from './stitch-frames-to-video';
export { SymbolicatedStackFrame } from './symbolicate-stacktrace';
export { OnStartData, RenderFramesOutput } from './types';
export { validateOutputFilename } from './validate-output-filename';
export type { AudioCodec };
import type { AudioCodec } from './options/audio-codec';
import { toMegabytes } from './to-megabytes';
export declare const RenderInternals: {
    resolveConcurrency: (userPreference: string | number | null) => number;
    serveStatic: (path: string | null, options: {
        port: number | null;
        downloadMap: import("./assets/download-map").DownloadMap;
        remotionRoot: string;
        offthreadVideoThreads: number;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        indent: boolean;
        offthreadVideoCacheSizeInBytes: number | null;
        binariesDirectory: string | null;
        forceIPv4: boolean;
    }) => Promise<{
        port: number;
        close: () => Promise<void>;
        compositor: import("./compositor/compositor").Compositor;
    }>;
    validateEvenDimensionsWithCodec: ({ width, height, codec, scale, wantsImageSequence, indent, logLevel, }: {
        width: number;
        height: number;
        scale: number;
        codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        wantsImageSequence: boolean;
        indent: boolean;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    }) => {
        actualWidth: number;
        actualHeight: number;
    };
    getFileExtensionFromCodec: <T extends "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav">(codec: T, audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null) => import("./file-extensions").FileExtension;
    tmpDir: (str: string) => string;
    deleteDirectory: (directory: string) => void;
    isServeUrl: (potentialUrl: string) => boolean;
    ensureOutputDirectory: (outputLocation: string) => void;
    getRealFrameRange: (durationInFrames: number, frameRange: import("./frame-range").FrameRange | null) => [number, number];
    validatePuppeteerTimeout: (timeoutInMilliseconds: unknown) => void;
    downloadFile: (options: {
        url: string;
        to: (contentDisposition: string | null, contentType: string | null) => string;
        onProgress: ((progress: {
            percent: number | null;
            downloaded: number;
            totalSize: number | null;
        }) => void) | undefined;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        indent: boolean;
        abortSignal: AbortSignal;
    }, retries?: number, attempt?: number) => Promise<{
        sizeInBytes: number;
        to: string;
    }>;
    parseStack: (stack: string[]) => import("./parse-browser-error-stack").UnsymbolicatedStackFrame[];
    symbolicateError: (symbolicateableError: SymbolicateableError) => Promise<import(".").ErrorWithStackFrame>;
    SymbolicateableError: typeof SymbolicateableError;
    getFramesToRender: (frameRange: [number, number], everyNthFrame: number) => number[];
    getExtensionOfFilename: (filename: string | null) => string | null;
    getDesiredPort: ({ desiredPort, from, hostsToTry, to, onPortUnavailable, }: {
        desiredPort: number | undefined;
        from: number;
        to: number;
        hostsToTry: string[];
        onPortUnavailable?: ((port: number) => Promise<"continue" | "stop">) | undefined;
    }) => Promise<{
        port: number;
        unlockPort: () => void;
        didUsePort: false;
    } | {
        port: number;
        unlockPort: () => void;
        didUsePort: true;
    }>;
    isPathInside: (thePath: string, potentialParent: string) => boolean;
    execa: {
        (file: string, arguments?: readonly string[] | undefined, options?: execa.Options<string> | undefined): execa.ExecaChildProcess<string>;
        (file: string, arguments?: readonly string[] | undefined, options?: execa.Options<null> | undefined): execa.ExecaChildProcess<Buffer>;
        (file: string, options?: execa.Options<string> | undefined): execa.ExecaChildProcess<string>;
        (file: string, options?: execa.Options<null> | undefined): execa.ExecaChildProcess<Buffer>;
        sync(file: string, arguments?: readonly string[] | undefined, options?: execa.SyncOptions<string> | undefined): execa.ExecaSyncReturnValue<string>;
        sync(file: string, arguments?: readonly string[] | undefined, options?: execa.SyncOptions<null> | undefined): execa.ExecaSyncReturnValue<Buffer>;
        sync(file: string, options?: execa.SyncOptions<string> | undefined): execa.ExecaSyncReturnValue<string>;
        sync(file: string, options?: execa.SyncOptions<null> | undefined): execa.ExecaSyncReturnValue<Buffer>;
        command(command: string, options?: execa.Options<string> | undefined): execa.ExecaChildProcess<string>;
        command(command: string, options?: execa.Options<null> | undefined): execa.ExecaChildProcess<Buffer>;
        commandSync(command: string, options?: execa.SyncOptions<string> | undefined): execa.ExecaSyncReturnValue<string>;
        commandSync(command: string, options?: execa.SyncOptions<null> | undefined): execa.ExecaSyncReturnValue<Buffer>;
        node(scriptPath: string, arguments?: readonly string[] | undefined, options?: execa.NodeOptions<string> | undefined): execa.ExecaChildProcess<string>;
        node(scriptPath: string, arguments?: readonly string[] | undefined, options?: execa.Options<null> | undefined): execa.ExecaChildProcess<Buffer>;
        node(scriptPath: string, options?: execa.Options<string> | undefined): execa.ExecaChildProcess<string>;
        node(scriptPath: string, options?: execa.Options<null> | undefined): execa.ExecaChildProcess<Buffer>;
    };
    registerErrorSymbolicationLock: () => number;
    unlockErrorSymbolicationLock: (id: number) => void;
    canUseParallelEncoding: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => boolean;
    mimeContentType: typeof mimeContentType;
    mimeLookup: typeof mimeLookup;
    validateConcurrency: ({ setting, value, checkIfValidForCurrentMachine, }: {
        value: unknown;
        setting: string;
        checkIfValidForCurrentMachine: boolean;
    }) => void;
    validPixelFormats: readonly ["yuv420p", "yuva420p", "yuv422p", "yuv444p", "yuv420p10le", "yuv422p10le", "yuv444p10le", "yuva444p10le"];
    DEFAULT_BROWSER: "chrome";
    validateFrameRange: (frameRange: import("./frame-range").FrameRange | null) => void;
    DEFAULT_OPENGL_RENDERER: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null;
    validateOpenGlRenderer: (option: unknown) => "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null;
    validCodecs: readonly ["h264", "h265", "vp8", "vp9", "mp3", "aac", "wav", "prores", "h264-mkv", "h264-ts", "gif"];
    DEFAULT_PIXEL_FORMAT: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le";
    validateJpegQuality: (q: unknown) => void;
    DEFAULT_TIMEOUT: number;
    DEFAULT_CODEC: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    logLevels: readonly ["trace", "verbose", "info", "warn", "error"];
    isEqualOrBelowLogLevel: (currentLevel: "error" | "info" | "trace" | "verbose" | "warn", level: "error" | "info" | "trace" | "verbose" | "warn") => boolean;
    isValidLogLevel: (level: string) => boolean;
    perf: typeof perf;
    convertToPositiveFrameIndex: ({ frame, durationInFrames, }: {
        frame: number;
        durationInFrames: number;
    }) => number;
    findRemotionRoot: () => string;
    validateBitrate: (bitrate: unknown, name: string) => void;
    getMinConcurrency: () => number;
    getMaxConcurrency: () => number;
    getDefaultAudioCodec: ({ codec, preferLossless, }: {
        codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        preferLossless: boolean;
    }) => "aac" | "mp3" | "opus" | "pcm-16" | null;
    defaultFileExtensionMap: {
        aac: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                aac: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        gif: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {};
        };
        h264: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                aac: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                mp3: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        "h264-mkv": {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                mp3: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        "h264-ts": {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                aac: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        h265: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                aac: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        mp3: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                mp3: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        prores: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                aac: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        vp8: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                opus: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        vp9: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                opus: {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
        wav: {
            default: import("./file-extensions").FileExtension;
            forAudioCodec: {
                "pcm-16": {
                    possible: import("./file-extensions").FileExtension[];
                    default: import("./file-extensions").FileExtension;
                };
            };
        };
    };
    supportedAudioCodecs: {
        readonly h264: readonly ["aac", "pcm-16", "mp3"];
        readonly 'h264-mkv': readonly ["pcm-16", "mp3"];
        readonly 'h264-ts': readonly ["pcm-16", "aac"];
        readonly aac: readonly ["aac", "pcm-16"];
        readonly avi: readonly [];
        readonly gif: readonly [];
        readonly h265: readonly ["aac", "pcm-16"];
        readonly mp3: readonly ["mp3", "pcm-16"];
        readonly prores: readonly ["aac", "pcm-16"];
        readonly vp8: readonly ["opus", "pcm-16"];
        readonly vp9: readonly ["opus", "pcm-16"];
        readonly wav: readonly ["pcm-16"];
    };
    makeFileExtensionMap: () => Record<string, ("aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav")[]>;
    defaultCodecsForFileExtension: Record<import("./file-extensions").FileExtension, "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav">;
    getExecutablePath: ({ indent, logLevel, type, binariesDirectory, }: {
        type: "compositor" | "ffmpeg" | "ffprobe";
        indent: boolean;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        binariesDirectory: string | null;
    }) => string;
    callFf: ({ args, bin, indent, logLevel, options, binariesDirectory, cancelSignal, }: {
        bin: "ffmpeg" | "ffprobe";
        args: (string | null)[];
        indent: boolean;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        binariesDirectory: string | null;
        cancelSignal: import("./make-cancel-signal").CancelSignal | undefined;
        options?: execa.Options<string> | undefined;
    }) => execa.ExecaChildProcess<string>;
    validStillImageFormats: readonly ["png", "jpeg", "pdf", "webp"];
    validVideoImageFormats: readonly ["png", "jpeg", "none"];
    DEFAULT_STILL_IMAGE_FORMAT: "jpeg" | "pdf" | "png" | "webp";
    DEFAULT_VIDEO_IMAGE_FORMAT: "jpeg" | "none" | "png";
    DEFAULT_JPEG_QUALITY: number;
    chalk: {
        enabled: () => boolean;
        visible: boolean;
        styles: Record<string, {
            codes: [number, number];
            name: string;
            wrap?: ((input: string, newline: boolean) => string) | undefined;
        }>;
        keys: Record<string, string[]>;
        alias?: ((name: string, col: string) => void) | undefined;
    } & {
        reset: (str: string) => string;
        bold: (str: string) => string;
        dim: (str: string) => string;
        italic: (str: string) => string;
        underline: (str: string) => string;
        inverse: (str: string) => string;
        hidden: (str: string) => string;
        strikethrough: (str: string) => string;
        black: (str: string) => string;
        red: (str: string) => string;
        green: (str: string) => string;
        yellow: (str: string) => string;
        blue: (str: string) => string;
        magenta: (str: string) => string;
        cyan: (str: string) => string;
        white: (str: string) => string;
        gray: (str: string) => string;
        bgBlack: (str: string) => string;
        bgRed: (str: string) => string;
        bgGreen: (str: string) => string;
        bgYellow: (str: string) => string;
        bgBlue: (str: string) => string;
        bgMagenta: (str: string) => string;
        bgWhite: (str: string) => string;
        blackBright: (str: string) => string;
        redBright: (str: string) => string;
        greenBright: (str: string) => string;
        yellowBright: (str: string) => string;
        blueBright: (str: string) => string;
        magentaBright: (str: string) => string;
        whiteBright: (str: string) => string;
        bgBlackBright: (str: string) => string;
        bgRedBright: (str: string) => string;
        bgGreenBright: (str: string) => string;
        bgYellowBright: (str: string) => string;
        bgBlueBright: (str: string) => string;
        bgMagentaBright: (str: string) => string;
        bgWhiteBright: (str: string) => string;
    };
    Log: {
        formatLogs: (logLevel: "error" | "info" | "trace" | "verbose" | "warn", options: import("./logger").LogOptions & {
            tag?: string | undefined;
        }, args: [message?: any, ...optionalParams: any[]]) => string[];
        trace: (options: import("./logger").LogOptions & {
            tag?: string | undefined;
        }, message?: any, ...optionalParams: any[]) => void | boolean;
        verbose: (options: import("./logger").LogOptions & {
            tag?: string | undefined;
        }, message?: any, ...optionalParams: any[]) => void | boolean;
        info: (options: import("./logger").LogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
        warn: (options: import("./logger").LogOptions, message?: any, ...optionalParams: any[]) => void | boolean;
        error: (options: import("./logger").LogOptions & {
            tag?: string | undefined;
        }, message?: any, ...optionalParams: any[]) => void | boolean;
    };
    INDENT_TOKEN: string;
    isColorSupported: () => boolean;
    HeadlessBrowser: typeof HeadlessBrowser;
    prepareServer: ({ webpackConfigOrServeUrl, port, remotionRoot, offthreadVideoThreads, logLevel, indent, offthreadVideoCacheSizeInBytes, binariesDirectory, forceIPv4, }: {
        webpackConfigOrServeUrl: string;
        port: number | null;
        remotionRoot: string;
        offthreadVideoThreads: number;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        indent: boolean;
        offthreadVideoCacheSizeInBytes: number | null;
        binariesDirectory: string | null;
        forceIPv4: boolean;
    }) => Promise<import("./prepare-server").RemotionServer>;
    makeOrReuseServer: (server: import("./prepare-server").RemotionServer | undefined, config: {
        webpackConfigOrServeUrl: string;
        port: number | null;
        remotionRoot: string;
        offthreadVideoThreads: number;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        indent: boolean;
        offthreadVideoCacheSizeInBytes: number | null;
        binariesDirectory: string | null;
        forceIPv4: boolean;
    }, { onDownload, }: {
        onDownload: import(".").RenderMediaOnDownload | null;
    }) => Promise<{
        server: import("./prepare-server").RemotionServer;
        cleanupServer: (force: boolean) => Promise<unknown>;
    }>;
    internalRenderStill: (options: {
        composition: import("remotion").VideoConfig;
        output: string | null;
        frame: number;
        serializedInputPropsWithCustomSchema: string;
        serializedResolvedPropsWithCustomSchema: string;
        imageFormat: "jpeg" | "pdf" | "png" | "webp";
        jpegQuality: number;
        puppeteerInstance: HeadlessBrowser | null;
        envVariables: Record<string, string>;
        overwrite: boolean;
        browserExecutable: import("./browser-executable").BrowserExecutable;
        onBrowserLog: ((log: import("./browser-log").BrowserLog) => void) | null;
        chromiumOptions: import("./open-browser").ChromiumOptions;
        scale: number;
        onDownload: import(".").RenderMediaOnDownload | null;
        cancelSignal: import("./make-cancel-signal").CancelSignal | null;
        indent: boolean;
        server: import("./prepare-server").RemotionServer | undefined;
        serveUrl: string;
        port: number | null;
        onArtifact: import("./render-frames").OnArtifact | null;
        onLog: import(".").OnLog;
        isProduction: boolean | null;
    } & import(".").ToOptions<Omit<{
        readonly mediaCacheSizeInBytes: {
            name: string;
            cliFlag: "media-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "mediaCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "media-cache-size-in-bytes";
        };
        readonly offthreadVideoCacheSizeInBytes: {
            name: string;
            cliFlag: "offthreadvideo-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-cache-size-in-bytes";
        };
        readonly offthreadVideoThreads: {
            name: string;
            cliFlag: "offthreadvideo-video-threads";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoThreads";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-video-threads";
        };
        readonly jpegQuality: {
            name: string;
            cliFlag: "jpeg-quality";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: string;
            docLink: string;
            type: number;
            setConfig: (q: number | undefined) => void;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            };
            id: "jpeg-quality";
        };
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
        readonly timeoutInMilliseconds: {
            name: string;
            cliFlag: "timeout";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "timeoutInMilliseconds";
            docLink: string;
            type: number;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            };
            setConfig: (value: number) => void;
            id: "timeout";
        };
        readonly binariesDirectory: {
            name: string;
            cliFlag: "binaries-directory";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "binariesDirectory";
            docLink: string;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: string | null;
            };
            setConfig: (value: string | null) => void;
            id: "binaries-directory";
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
        readonly apiKey: {
            name: string;
            cliFlag: "api-key";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "apiKey";
            docLink: string;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: string | null;
            };
            setConfig: (value: string | null) => void;
            id: "api-key";
        };
        readonly licenseKey: {
            name: string;
            cliFlag: "license-key";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "licenseKey";
            docLink: string;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: string | null;
            };
            setConfig: (value: string | null) => void;
            id: "license-key";
        };
    }, "apiKey">>) => Promise<{
        buffer: Buffer | null;
        contentType: string;
    }>;
    internalOpenBrowser: ({ browser, browserExecutable, chromiumOptions, forceDeviceScaleFactor, indent, viewport, logLevel, onBrowserDownload, chromeMode, }: {
        browserExecutable: string | null;
        chromiumOptions: import("./open-browser").ChromiumOptions;
        forceDeviceScaleFactor: number | undefined;
        viewport: import("./browser/PuppeteerViewport").Viewport | null;
        indent: boolean;
        browser: "chrome";
    } & import(".").ToOptions<{
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
    }>) => Promise<HeadlessBrowser>;
    internalSelectComposition: (options: {
        serializedInputPropsWithCustomSchema: string;
        envVariables: Record<string, string>;
        puppeteerInstance: HeadlessBrowser | undefined;
        onBrowserLog: ((log: import("./browser-log").BrowserLog) => void) | null;
        browserExecutable: import("./browser-executable").BrowserExecutable;
        chromiumOptions: import("./open-browser").ChromiumOptions;
        port: number | null;
        indent: boolean;
        server: import("./prepare-server").RemotionServer | undefined;
        serveUrl: string;
        id: string;
        onServeUrlVisited: () => void;
    } & import(".").ToOptions<{
        readonly mediaCacheSizeInBytes: {
            name: string;
            cliFlag: "media-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "mediaCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "media-cache-size-in-bytes";
        };
        readonly offthreadVideoCacheSizeInBytes: {
            name: string;
            cliFlag: "offthreadvideo-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-cache-size-in-bytes";
        };
        readonly offthreadVideoThreads: {
            name: string;
            cliFlag: "offthreadvideo-video-threads";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoThreads";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-video-threads";
        };
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
        readonly timeoutInMilliseconds: {
            name: string;
            cliFlag: "timeout";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "timeoutInMilliseconds";
            docLink: string;
            type: number;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            };
            setConfig: (value: number) => void;
            id: "timeout";
        };
        readonly binariesDirectory: {
            name: string;
            cliFlag: "binaries-directory";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "binariesDirectory";
            docLink: string;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: string | null;
            };
            setConfig: (value: string | null) => void;
            id: "binaries-directory";
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
    }>) => Promise<{
        metadata: import("remotion").VideoConfig;
        propsSize: number;
    }>;
    internalGetCompositions: (args_0: {
        serializedInputPropsWithCustomSchema: string;
        envVariables: Record<string, string>;
        puppeteerInstance: HeadlessBrowser | undefined;
        onBrowserLog: ((log: import("./browser-log").BrowserLog) => void) | null;
        browserExecutable: import("./browser-executable").BrowserExecutable;
        chromiumOptions: import("./open-browser").ChromiumOptions;
        port: number | null;
        server: import("./prepare-server").RemotionServer | undefined;
        indent: boolean;
        serveUrlOrWebpackUrl: string;
        onLog: import(".").OnLog;
    } & import(".").ToOptions<{
        readonly mediaCacheSizeInBytes: {
            name: string;
            cliFlag: "media-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "mediaCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "media-cache-size-in-bytes";
        };
        readonly offthreadVideoCacheSizeInBytes: {
            name: string;
            cliFlag: "offthreadvideo-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-cache-size-in-bytes";
        };
        readonly offthreadVideoThreads: {
            name: string;
            cliFlag: "offthreadvideo-video-threads";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoThreads";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-video-threads";
        };
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
        readonly timeoutInMilliseconds: {
            name: string;
            cliFlag: "timeout";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "timeoutInMilliseconds";
            docLink: string;
            type: number;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            };
            setConfig: (value: number) => void;
            id: "timeout";
        };
        readonly binariesDirectory: {
            name: string;
            cliFlag: "binaries-directory";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "binariesDirectory";
            docLink: string;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: string | null;
            };
            setConfig: (value: string | null) => void;
            id: "binaries-directory";
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
    }>) => Promise<import("remotion").VideoConfig[]>;
    internalRenderFrames: (args_0: {
        onStart: ((data: import("./types").OnStartData) => void) | null;
        onFrameUpdate: ((framesRendered: number, frameIndex: number, timeToRenderInMilliseconds: number) => void) | null;
        outputDir: string | null;
        envVariables: Record<string, string>;
        imageFormat: "jpeg" | "none" | "png";
        jpegQuality: number;
        frameRange: import("./frame-range").FrameRange | null;
        everyNthFrame: number;
        puppeteerInstance: HeadlessBrowser | undefined;
        browserExecutable: import("./browser-executable").BrowserExecutable;
        onBrowserLog: ((log: import("./browser-log").BrowserLog) => void) | null;
        onFrameBuffer: ((buffer: Buffer, frame: number) => void) | null;
        onDownload: import(".").RenderMediaOnDownload | null;
        chromiumOptions: import("./open-browser").ChromiumOptions;
        scale: number;
        port: number | null;
        cancelSignal: import("./make-cancel-signal").CancelSignal | undefined;
        composition: Omit<import("remotion").VideoConfig, "defaultProps" | "props">;
        indent: boolean;
        server: import("./prepare-server").RemotionServer | undefined;
        muted: boolean;
        concurrency: string | number | null;
        webpackBundleOrServeUrl: string;
        serializedInputPropsWithCustomSchema: string;
        serializedResolvedPropsWithCustomSchema: string;
        parallelEncodingEnabled: boolean;
        compositionStart: number;
        onArtifact: import("./render-frames").OnArtifact | null;
        onLog: import(".").OnLog;
    } & import(".").ToOptions<{
        readonly mediaCacheSizeInBytes: {
            name: string;
            cliFlag: "media-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "mediaCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "media-cache-size-in-bytes";
        };
        readonly forSeamlessAacConcatenation: {
            name: string;
            cliFlag: "for-seamless-aac-concatenation";
            description: () => import("react/jsx-runtime").JSX.Element;
            docLink: string;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: true;
            } | {
                source: string;
                value: false;
            };
            setConfig: (value: boolean) => void;
            ssrName: string;
            type: boolean;
            id: "for-seamless-aac-concatenation";
        };
        readonly offthreadVideoCacheSizeInBytes: {
            name: string;
            cliFlag: "offthreadvideo-cache-size-in-bytes";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoCacheSizeInBytes";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-cache-size-in-bytes";
        };
        readonly offthreadVideoThreads: {
            name: string;
            cliFlag: "offthreadvideo-video-threads";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "offthreadVideoThreads";
            docLink: string;
            type: number | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            } | {
                source: string;
                value: null;
            };
            setConfig: (size: number | null) => void;
            id: "offthreadvideo-video-threads";
        };
        readonly jpegQuality: {
            name: string;
            cliFlag: "jpeg-quality";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: string;
            docLink: string;
            type: number;
            setConfig: (q: number | undefined) => void;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            };
            id: "jpeg-quality";
        };
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
        readonly timeoutInMilliseconds: {
            name: string;
            cliFlag: "timeout";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "timeoutInMilliseconds";
            docLink: string;
            type: number;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: number;
            };
            setConfig: (value: number) => void;
            id: "timeout";
        };
        readonly binariesDirectory: {
            name: string;
            cliFlag: "binaries-directory";
            description: () => import("react/jsx-runtime").JSX.Element;
            ssrName: "binariesDirectory";
            docLink: string;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                source: string;
                value: string | null;
            };
            setConfig: (value: string | null) => void;
            id: "binaries-directory";
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
        readonly imageSequencePattern: {
            name: string;
            cliFlag: "image-sequence-pattern";
            ssrName: string;
            description: () => import("react/jsx-runtime").JSX.Element;
            docLink: null;
            type: string | null;
            getValue: ({ commandLine }: {
                commandLine: Record<string, unknown>;
            }) => {
                value: string;
                source: string;
            };
            setConfig: (pattern: string | null) => void;
            id: "image-sequence-pattern";
        };
    }>) => Promise<import("./types").RenderFramesOutput>;
    internalRenderMedia: (args_0: import("./render-media").InternalRenderMediaOptions) => Promise<{
        buffer: Buffer | null;
        slowestFrames: import("./render-media").SlowFrame[];
        contentType: string;
    }>;
    validOpenGlRenderers: readonly ["swangle", "angle", "egl", "swiftshader", "vulkan", "angle-egl"];
    isIpV6Supported: (flattened: import("os").NetworkInterfaceInfo[]) => boolean;
    getChromiumGpuInformation: ({ browserExecutable, indent, logLevel, chromiumOptions, timeoutInMilliseconds, onBrowserDownload, chromeMode, onLog, }: {
        browserExecutable: import("./browser-executable").BrowserExecutable;
        indent: boolean;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        chromiumOptions: import("./open-browser").ChromiumOptions;
        timeoutInMilliseconds: number;
        onBrowserDownload: import(".").OnBrowserDownload;
        chromeMode: "chrome-for-testing" | "headless-shell";
        onLog: import(".").OnLog;
    }) => Promise<{
        feature: string;
        status: string;
    }[]>;
    getPortConfig: (preferIpv4: boolean) => {
        host: string;
        hostsToTry: string[];
    };
    makeDownloadMap: () => import("./assets/download-map").DownloadMap;
    getExtensionFromAudioCodec: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16") => "aac" | "mp3" | "opus" | "wav";
    makeFileExecutableIfItIsNot: (path: string) => void;
    resolveAudioCodec: ({ codec, setting, preferLossless, separateAudioTo, }: {
        setting: "aac" | "mp3" | "opus" | "pcm-16" | null;
        codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        preferLossless: boolean;
        separateAudioTo: string | null;
    }) => "aac" | "mp3" | "opus" | "pcm-16" | null;
    getShouldRenderAudio: ({ codec, assetsInfo, enforceAudioTrack, muted, }: {
        codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        assetsInfo: import("./assets/download-map").RenderAssetInfo | null;
        enforceAudioTrack: boolean;
        muted: boolean;
    }) => "maybe" | "no" | "yes";
    codecSupportsMedia: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => {
        video: boolean;
        audio: boolean;
    };
    toMegabytes: typeof toMegabytes;
    internalEnsureBrowser: (options: {
        browserExecutable: import("./browser-executable").BrowserExecutable;
        indent: boolean;
        chromeMode: "chrome-for-testing" | "headless-shell";
    } & import(".").ToOptions<{
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
    }>) => Promise<import("./ensure-browser").BrowserStatus>;
    printUsefulErrorMessage: (err: Error, logLevel: "error" | "info" | "trace" | "verbose" | "warn", indent: boolean) => void;
    DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS: number;
    canConcatVideoSeamlessly: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => codec is "h264";
    canConcatAudioSeamlessly: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null, chunkDurationInFrames: number) => boolean;
    internalCombineChunks: ({ outputLocation: output, onProgress, codec, fps, numberOfGifLoops, audioBitrate, indent, logLevel, binariesDirectory, cancelSignal, metadata, audioFiles, videoFiles, framesPerChunk, audioCodec, preferLossless, everyNthFrame, frameRange, compositionDurationInFrames, }: {
        outputLocation: string;
        audioFiles: string[];
        codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        videoFiles: string[];
        fps: number;
        framesPerChunk: number;
        preferLossless: boolean;
        compositionDurationInFrames: number;
    } & {
        onProgress: import("./combine-chunks").CombineChunksOnProgress;
        audioBitrate: string | null;
        numberOfGifLoops: number | null;
        logLevel: "error" | "info" | "trace" | "verbose" | "warn";
        binariesDirectory: string | null;
        audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null;
        cancelSignal: import("./make-cancel-signal").CancelSignal | undefined;
        metadata: Record<string, string> | null;
        frameRange: import("./frame-range").FrameRange | null;
        everyNthFrame: number;
    } & {
        indent: boolean;
    }) => Promise<void>;
    defaultOnLog: import(".").OnLog;
};
