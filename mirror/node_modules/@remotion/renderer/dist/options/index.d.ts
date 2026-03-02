import type { AnyRemotionOption } from './option';
export declare const allOptions: {
    audioCodecOption: {
        cliFlag: "audio-codec";
        setConfig: (audioCodec: "aac" | "mp3" | "opus" | "pcm-16" | null) => void;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: "aac" | "mp3" | "opus" | "pcm-16";
        } | {
            source: string;
            value: null;
        };
        description: () => string;
        docLink: string;
        name: string;
        ssrName: "audioCodec";
        type: "aac" | "mp3" | "opus" | "pcm-16";
        id: "audio-codec";
    };
    benchmarkConcurrenciesOption: {
        name: string;
        cliFlag: "concurrencies";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: string | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: string;
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (value: string | null) => void;
        id: "concurrencies";
    };
    browserExecutableOption: {
        name: string;
        cliFlag: "browser-executable";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "browserExecutable";
        docLink: string;
        type: import("..").BrowserExecutable;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: import("..").BrowserExecutable;
        };
        setConfig: (value: import("..").BrowserExecutable) => void;
        id: "browser-executable";
    };
    concurrencyOption: {
        name: string;
        cliFlag: "concurrency";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "concurrency";
        docLink: string;
        type: import("./concurrency").Concurrency;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: import("./concurrency").Concurrency;
        };
        setConfig: (value: import("./concurrency").Concurrency) => void;
        id: "concurrency";
    };
    scaleOption: {
        name: string;
        cliFlag: "scale";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: number;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: number;
        };
        setConfig: (scale: number) => void;
        id: "scale";
    };
    crfOption: {
        name: string;
        cliFlag: "crf";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: number;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: import("..").Crf;
        };
        setConfig: (crf: import("..").Crf) => void;
        id: "crf";
    };
    jpegQualityOption: {
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
    videoBitrateOption: {
        name: string;
        cliFlag: "video-bitrate";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: string | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string | null;
        };
        setConfig: (bitrate: string | null) => void;
        id: "video-bitrate";
    };
    audioBitrateOption: {
        name: string;
        cliFlag: "audio-bitrate";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: string;
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (value: string | null) => void;
        id: "audio-bitrate";
    };
    enforceAudioOption: {
        name: string;
        cliFlag: "enforce-audio-track";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
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
        id: "enforce-audio-track";
    };
    everyNthFrameOption: {
        name: string;
        cliFlag: "every-nth-frame";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "everyNthFrame";
        docLink: string;
        type: number;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: number;
        };
        setConfig: (value: number) => void;
        id: "every-nth-frame";
    };
    mutedOption: {
        name: string;
        cliFlag: "muted";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: () => void;
        id: "muted";
    };
    videoCodecOption: {
        name: string;
        cliFlag: "codec";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }, { compositionCodec, configFile, downloadName, outName, uiCodec, }: {
            outName: string | null;
            downloadName: string | null;
            configFile: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
            uiCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
            compositionCodec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav" | null;
        }) => {
            value: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
            source: string;
        };
        setConfig: (newCodec: import("..").CodecOrUndefined) => void;
        id: "codec";
    };
    offthreadVideoCacheSizeInBytesOption: {
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
    offthreadVideoThreadsOption: {
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
    webhookCustomDataOption: {
        name: string;
        cliFlag: "webhook-custom-data";
        description: (type: "cli" | "ssr") => import("react/jsx-runtime").JSX.Element;
        ssrName: "customData";
        docLink: string;
        type: Record<string, unknown> | null;
        getValue: () => never;
        setConfig: () => never;
        id: "webhook-custom-data";
    };
    colorSpaceOption: {
        name: string;
        cliFlag: "color-space";
        description: () => import("react/jsx-runtime").JSX.Element;
        docLink: string;
        ssrName: string;
        type: "bt2020-ncl" | "bt601" | "bt709" | "default" | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: "bt2020-ncl" | "bt601" | "bt709" | "default";
        };
        setConfig: (value: "bt2020-ncl" | "bt601" | "bt709" | "default" | null) => void;
        id: "color-space";
    };
    deleteAfterOption: {
        name: string;
        cliFlag: "delete-after";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "deleteAfter";
        docLink: string;
        type: import("./delete-after").DeleteAfter | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: import("./delete-after").DeleteAfter;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: import("./delete-after").DeleteAfter | null) => void;
        id: "delete-after";
    };
    disableWebSecurityOption: {
        name: string;
        cliFlag: "disable-web-security";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "disableWebSecurity";
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        id: "disable-web-security";
    };
    disallowParallelEncodingOption: {
        name: string;
        cliFlag: "disallow-parallel-encoding";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "disallow-parallel-encoding";
    };
    folderExpiryOption: {
        name: string;
        cliFlag: "enable-folder-expiry";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "enableFolderExpiry";
        docLink: string;
        type: boolean | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean | null;
        };
        setConfig: (value: boolean | null) => void;
        id: "enable-folder-expiry";
    };
    enableMultiprocessOnLinuxOption: {
        name: string;
        cliFlag: "enable-multiprocess-on-linux";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        id: "enable-multiprocess-on-linux";
    };
    glOption: {
        cliFlag: "gl";
        docLink: string;
        name: string;
        type: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null;
        ssrName: string;
        description: () => import("react/jsx-runtime").JSX.Element;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan";
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (value: "angle" | "angle-egl" | "egl" | "swangle" | "swiftshader" | "vulkan" | null) => void;
        id: "gl";
    };
    enableLambdaInsights: {
        name: string;
        cliFlag: "enable-lambda-insights";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        setConfig: (value: boolean) => void;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        id: "enable-lambda-insights";
    };
    encodingMaxRateOption: {
        name: string;
        cliFlag: "max-rate";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "encodingMaxRate";
        docLink: string;
        type: string | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: string;
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (newMaxRate: string | null) => void;
        id: "max-rate";
    };
    encodingBufferSizeOption: {
        name: string;
        cliFlag: "buffer-size";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "encodingBufferSize";
        docLink: string;
        type: string | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: string;
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (bitrate: string | null) => void;
        id: "buffer-size";
    };
    beepOnFinishOption: {
        name: string;
        cliFlag: "beep-on-finish";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "beep-on-finish";
    };
    numberOfGifLoopsOption: {
        name: string;
        cliFlag: "number-of-gif-loops";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "numberOfGifLoops";
        docLink: string;
        type: number | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: number;
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (newLoop: import("./number-of-gif-loops").NumberOfGifLoops) => void;
        id: "number-of-gif-loops";
    };
    reproOption: {
        name: string;
        cliFlag: "repro";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig: (should: boolean) => void;
        id: "repro";
    };
    runsOption: {
        name: string;
        cliFlag: "runs";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: number;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: number;
            source: string;
        };
        setConfig: (value: number) => void;
        id: "runs";
    };
    noOpenOption: {
        name: string;
        cliFlag: "no-open";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: true;
            source: string;
        } | {
            value: false;
            source: string;
        };
        setConfig: (shouldOpen: boolean) => void;
        id: "no-open";
    };
    pixelFormatOption: {
        name: string;
        cliFlag: "pixel-format";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "pixelFormat";
        docLink: string;
        type: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le";
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le";
        };
        setConfig: (value: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le") => void;
        id: "pixel-format";
    };
    preferLosslessOption: {
        name: string;
        cliFlag: "prefer-lossless";
        description: () => import("react/jsx-runtime").JSX.Element;
        docLink: string;
        type: boolean;
        ssrName: "preferLossless";
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: true;
            source: string;
        } | {
            value: false;
            source: string;
        };
        setConfig: (val: boolean) => void;
        id: "prefer-lossless";
    };
    proResProfileOption: {
        name: string;
        cliFlag: "prores-profile";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "proResProfile";
        docLink: string;
        type: import("./prores-profile").ProResProfile | undefined;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: import("./prores-profile").ProResProfile;
        } | {
            source: string;
            value: undefined;
        };
        setConfig: (value: import("./prores-profile").ProResProfile | undefined) => void;
        id: "prores-profile";
    };
    x264Option: {
        name: string;
        cliFlag: "x264-preset";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "x264Preset";
        docLink: string;
        type: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow" | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow";
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (profile: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow" | null) => void;
        id: "x264-preset";
    };
    logLevelOption: {
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
    delayRenderTimeoutInMillisecondsOption: {
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
    headlessOption: {
        name: string;
        cliFlag: "disable-headless";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        id: "disable-headless";
    };
    overwriteOption: {
        name: string;
        cliFlag: "overwrite";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }, defaultValue: boolean) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        id: "overwrite";
    };
    binariesDirectoryOption: {
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
    forSeamlessAacConcatenationOption: {
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
    separateAudioOption: {
        cliFlag: string;
        description: () => string;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        name: string;
        setConfig: () => never;
        ssrName: string;
        type: string | null;
        id: string;
    };
    publicPathOption: {
        name: string;
        cliFlag: "public-path";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "publicPath";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: string | null) => void;
        type: string | null;
        id: "public-path";
    };
    publicDirOption: {
        name: string;
        cliFlag: "public-dir";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "publicDir";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: string | null) => void;
        type: string | null;
        id: "public-dir";
    };
    onBrowserDownloadOption: {
        name: string;
        cliFlag: "on-browser-download";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "onBrowserDownload";
        docLink: string;
        type: import("./on-browser-download").OnBrowserDownload;
        getValue: () => never;
        setConfig: () => never;
        id: "on-browser-download";
    };
    throwIfSiteExistsOption: {
        cliFlag: string;
        description: () => string;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        name: string;
        setConfig: () => never;
        ssrName: string;
        type: boolean;
        id: string;
    };
    disableGitSourceOption: {
        cliFlag: string;
        description: () => string;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        name: string;
        setConfig: () => never;
        ssrName: string;
        type: boolean;
        id: string;
    };
    metadataOption: {
        name: string;
        cliFlag: "metadata";
        description: (mode: "cli" | "ssr") => import("react/jsx-runtime").JSX.Element;
        docLink: string;
        type: import("./metadata").Metadata;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: {
                [k: string]: string;
            };
        };
        setConfig: (newMetadata: import("./metadata").Metadata) => void;
        ssrName: string;
        id: "metadata";
    };
    hardwareAccelerationOption: {
        name: string;
        cliFlag: "hardware-acceleration";
        description: () => string;
        ssrName: string;
        docLink: string;
        type: "disable" | "if-possible" | "required";
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: "disable" | "if-possible" | "required";
        };
        setConfig: (value: "disable" | "if-possible" | "required") => void;
        id: "hardware-acceleration";
    };
    chromeModeOption: {
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
    apiKeyOption: {
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
    licenseKeyOption: {
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
    audioLatencyHintOption: {
        name: string;
        cliFlag: "audio-latency-hint";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "audioLatencyHint";
        docLink: string;
        type: AudioContextLatencyCategory;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: AudioContextLatencyCategory;
            source: string;
        } | {
            value: null;
            source: string;
        };
        setConfig: (profile: AudioContextLatencyCategory | null) => void;
        id: "audio-latency-hint";
    };
    enableCrossSiteIsolationOption: {
        name: string;
        cliFlag: "cross-site-isolation";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "cross-site-isolation";
    };
    ignoreCertificateErrorsOption: {
        name: string;
        cliFlag: "ignore-certificate-errors";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "ignoreCertificateErrors";
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        id: "ignore-certificate-errors";
    };
    imageSequencePatternOption: {
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
    mediaCacheSizeInBytesOption: {
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
    darkModeOption: {
        name: string;
        cliFlag: "dark-mode";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: string;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        id: "dark-mode";
    };
    publicLicenseKeyOption: {
        name: string;
        cliFlag: "public-license-key";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "publicLicenseKey";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string | null;
        };
        setConfig: (value: string | null) => void;
        type: string | null;
        id: "public-license-key";
    };
    isProductionOption: {
        name: string;
        cliFlag: "is-production";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "isProduction";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean | null;
        };
        setConfig: (value: boolean | null) => void;
        type: boolean | null;
        id: "is-production";
    };
    askAIOption: {
        name: string;
        cliFlag: "disable-ask-ai";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "disable-ask-ai";
    };
    experimentalClientSideRenderingOption: {
        name: string;
        cliFlag: "enable-experimental-client-side-rendering";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "enable-experimental-client-side-rendering";
    };
    experimentalVisualModeOption: {
        name: string;
        cliFlag: "experimental-visual-mode";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "experimental-visual-mode";
    };
    keyboardShortcutsOption: {
        name: string;
        cliFlag: "disable-keyboard-shortcuts";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "disable-keyboard-shortcuts";
    };
    framesOption: {
        name: string;
        cliFlag: "frames";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "frameRange";
        docLink: string;
        type: import("..").FrameRange | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: import("..").FrameRange | null;
        };
        setConfig: (value: import("..").FrameRange | null) => void;
        id: "frames";
    };
    forceNewStudioOption: {
        name: string;
        cliFlag: "force-new";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "force-new";
    };
    numberOfSharedAudioTagsOption: {
        name: string;
        cliFlag: "number-of-shared-audio-tags";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: number;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: number;
            source: string;
        };
        setConfig(value: number): void;
        id: "number-of-shared-audio-tags";
    };
    ipv4Option: {
        name: string;
        cliFlag: "ipv4";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "ipv4";
    };
    stillImageFormatOption: {
        name: string;
        cliFlag: "image-format";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "imageFormat";
        docLink: string;
        type: "jpeg" | "pdf" | "png" | "webp" | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: "jpeg" | "pdf" | "png" | "webp";
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: "jpeg" | "pdf" | "png" | "webp" | null) => void;
        id: string;
    };
    userAgentOption: {
        name: string;
        cliFlag: "user-agent";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "userAgent";
        docLink: string;
        type: string | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: string | null) => void;
        id: "user-agent";
    };
    videoImageFormatOption: {
        name: string;
        cliFlag: "image-format";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "imageFormat";
        docLink: string;
        type: "jpeg" | "none" | "png" | null;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: "jpeg" | "none" | "png";
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: "jpeg" | "none" | "png" | null) => void;
        id: string;
    };
    overrideHeightOption: {
        name: string;
        cliFlag: "height";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
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
        setConfig: (height: number | null) => void;
        id: "height";
    };
    overrideWidthOption: {
        name: string;
        cliFlag: "width";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
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
        setConfig: (width: number | null) => void;
        id: "width";
    };
    overrideFpsOption: {
        name: string;
        cliFlag: "fps";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
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
        setConfig: (fps: number | null) => void;
        id: "fps";
    };
    overrideDurationOption: {
        name: string;
        cliFlag: "duration";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
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
        setConfig: (duration: number | null) => void;
        id: "duration";
    };
    rspackOption: {
        name: string;
        cliFlag: "experimental-rspack";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: null;
        type: boolean;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            value: boolean;
            source: string;
        };
        setConfig(value: boolean): void;
        id: "experimental-rspack";
    };
    outDirOption: {
        name: string;
        cliFlag: "out-dir";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "outDir";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: string | null) => void;
        type: string | null;
        id: "out-dir";
    };
    packageManagerOption: {
        name: string;
        cliFlag: "package-manager";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "packageManager";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: string | null) => void;
        type: string | null;
        id: "package-manager";
    };
    webpackPollOption: {
        name: string;
        cliFlag: "webpack-poll";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: number;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: number | null) => void;
        type: number | null;
        id: "webpack-poll";
    };
    stillFrameOption: {
        name: string;
        cliFlag: "frame";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: "frame";
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: number;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: number | null) => void;
        type: number | null;
        id: "frame";
    };
    imageSequenceOption: {
        name: string;
        cliFlag: "sequence";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        type: boolean;
        id: "sequence";
    };
    versionFlagOption: {
        name: string;
        cliFlag: "version";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: () => never;
        type: string | null;
        id: "version";
    };
    bundleCacheOption: {
        name: string;
        cliFlag: "bundle-cache";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: boolean;
        };
        setConfig: (value: boolean) => void;
        type: boolean;
        id: "bundle-cache";
    };
    envFileOption: {
        name: string;
        cliFlag: "env-file";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: string | null) => void;
        type: string | null;
        id: "env-file";
    };
    portOption: {
        name: string;
        cliFlag: "port";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: number;
        } | {
            source: string;
            value: null;
        };
        setConfig: (value: number | null) => void;
        type: number | null;
        id: "port";
    };
    propsOption: {
        name: string;
        cliFlag: "props";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: () => never;
        type: string | null;
        id: "props";
    };
    configOption: {
        name: string;
        cliFlag: "config";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: () => never;
        type: string | null;
        id: "config";
    };
    browserOption: {
        name: string;
        cliFlag: "browser";
        description: () => import("react/jsx-runtime").JSX.Element;
        ssrName: null;
        docLink: string;
        getValue: ({ commandLine }: {
            commandLine: Record<string, unknown>;
        }) => {
            source: string;
            value: string;
        } | {
            source: string;
            value: null;
        };
        setConfig: () => never;
        type: string | null;
        id: "browser";
    };
};
export type AvailableOptions = keyof typeof allOptions;
export type TypeOfOption<Type> = Type extends AnyRemotionOption<infer X> ? X : never;
