export declare const validateEvenDimensionsWithCodec: ({ width, height, codec, scale, wantsImageSequence, indent, logLevel, }: {
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
