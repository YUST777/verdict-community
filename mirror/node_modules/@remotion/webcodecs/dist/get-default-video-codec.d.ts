export declare const getDefaultVideoCodec: ({ container, }: {
    container: "mp4" | "wav" | "webm";
}) => "h264" | "h265" | "vp8" | "vp9" | null;
