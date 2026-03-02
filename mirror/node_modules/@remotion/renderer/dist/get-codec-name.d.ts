export type CodecSettings = {
    encoderName: string;
    hardwareAccelerated: boolean;
};
export declare const hasSpecifiedUnsupportedHardwareQualifySettings: ({ encodingMaxRate, encodingBufferSize, crf, }: {
    encodingMaxRate: string | null;
    encodingBufferSize: string | null;
    crf: unknown;
}) => "crf" | "encodingBufferSize" | "encodingMaxRate" | null;
export declare const getCodecName: ({ codec, encodingMaxRate, encodingBufferSize, crf, hardwareAcceleration, logLevel, indent, }: {
    codec: "aac" | "gif" | "h264" | "h264-mkv" | "h264-ts" | "h265" | "mp3" | "prores" | "vp8" | "vp9" | "wav";
    hardwareAcceleration: "disable" | "if-possible" | "required";
    encodingMaxRate: string | null;
    encodingBufferSize: string | null;
    crf: unknown;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
}) => CodecSettings | null;
