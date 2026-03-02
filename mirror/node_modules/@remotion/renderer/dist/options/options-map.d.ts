export declare const optionsMap: {
    readonly renderMedia: {
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
        readonly videoBitrate: {
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
        readonly numberOfGifLoops: {
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
        readonly repro: {
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
        readonly x264Preset: {
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
        readonly audioBitrate: {
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
        readonly colorSpace: {
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
        readonly codec: {
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
        readonly disallowParallelEncoding: {
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
        readonly encodingMaxRate: {
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
        readonly encodingBufferSize: {
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
        readonly muted: {
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
        readonly separateAudioTo: {
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
        readonly audioCodec: {
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
        readonly onBrowserDownload: {
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
        readonly hardwareAcceleration: {
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
    };
    readonly stitchFramesToVideo: {
        readonly separateAudioTo: {
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
        readonly hardwareAcceleration: {
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
    };
    readonly renderStill: {
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
            type: import("./on-browser-download").OnBrowserDownload;
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
    };
    readonly getCompositions: {
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
            type: import("./on-browser-download").OnBrowserDownload;
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
    };
    readonly selectComposition: {
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
            type: import("./on-browser-download").OnBrowserDownload;
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
    };
    readonly renderFrames: {
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
            type: import("./on-browser-download").OnBrowserDownload;
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
    };
    readonly renderMediaOnLambda: {
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
        readonly videoBitrate: {
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
        readonly numberOfGifLoops: {
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
        readonly preferLossless: {
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
        readonly audioBitrate: {
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
        readonly deleteAfter: {
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
        readonly x264Preset: {
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
        readonly encodingMaxRate: {
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
        readonly encodingBufferSize: {
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
        readonly colorSpace: {
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
        readonly muted: {
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
    };
    readonly renderStillOnLambda: {
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
        readonly deleteAfter: {
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
        readonly scale: {
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
    };
    readonly getCompositionsOnLambda: {
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
    };
    readonly renderMediaOnCloudRun: {
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
        readonly numberOfGifLoops: {
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
        readonly preferLossless: {
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
        readonly colorSpace: {
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
        readonly audioBitrate: {
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
        readonly videoBitrate: {
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
        readonly x264Preset: {
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
        readonly encodingMaxRate: {
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
        readonly encodingBufferSize: {
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
        readonly muted: {
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
        readonly delayRenderTimeoutInMilliseconds: {
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
        readonly enforceAudioTrack: {
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
        readonly scale: {
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
        readonly crf: {
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
    };
    readonly renderStillOnCloudRun: {
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
        readonly scale: {
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
        readonly delayRenderTimeoutInMilliseconds: {
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
    };
    readonly ensureBrowser: {
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
            type: import("./on-browser-download").OnBrowserDownload;
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
    };
    readonly openBrowser: {
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
            type: import("./on-browser-download").OnBrowserDownload;
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
    };
    readonly deploySiteLambda: {
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
        readonly throwIfSiteExists: {
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
    };
    readonly deploySiteCloudRun: {
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
    };
};
