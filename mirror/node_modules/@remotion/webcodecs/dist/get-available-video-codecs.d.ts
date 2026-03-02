export declare const availableVideoCodecs: readonly ["vp8", "vp9", "h264", "h265"];
export type ConvertMediaVideoCodec = (typeof availableVideoCodecs)[number];
export declare const getAvailableVideoCodecs: ({ container, }: {
    container: "mp4" | "wav" | "webm";
}) => ("h264" | "h265" | "vp8" | "vp9")[];
