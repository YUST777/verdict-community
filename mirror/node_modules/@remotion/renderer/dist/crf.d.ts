export type Crf = number | undefined;
export declare const getDefaultCrfForCodec: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => number | null;
export declare const getValidCrfRanges: (codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav") => [number, number];
export declare const validateQualitySettings: ({ codec, crf, videoBitrate, encodingMaxRate, encodingBufferSize, hardwareAcceleration, }: {
    crf: unknown;
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    videoBitrate: string | null;
    encodingMaxRate: string | null;
    encodingBufferSize: string | null;
    hardwareAcceleration: "disable" | "if-possible" | "required";
}) => string[];
