export declare const generateFfmpegArgs: ({ hasPreencoded, proResProfileName, pixelFormat, x264Preset, codec, crf, videoBitrate, encodingMaxRate, encodingBufferSize, colorSpace, hardwareAcceleration, indent, logLevel, }: {
    hasPreencoded: boolean;
    proResProfileName: string | null;
    pixelFormat: "yuv420p" | "yuv420p10le" | "yuv422p" | "yuv422p10le" | "yuv444p" | "yuv444p10le" | "yuva420p" | "yuva444p10le";
    x264Preset: "fast" | "faster" | "medium" | "placebo" | "slow" | "slower" | "superfast" | "ultrafast" | "veryfast" | "veryslow" | null;
    crf: unknown;
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    videoBitrate: string | null;
    encodingMaxRate: string | null;
    encodingBufferSize: string | null;
    colorSpace: "bt2020-ncl" | "bt601" | "bt709" | "default" | null;
    hardwareAcceleration: "disable" | "if-possible" | "required";
    indent: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
}) => string[][];
