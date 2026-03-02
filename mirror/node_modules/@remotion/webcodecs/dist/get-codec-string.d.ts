export declare const getCodecStringForEncoder: ({ codec, fps, height, width, }: {
    codec: "h264" | "h265" | "vp8" | "vp9";
    fps: number | null;
    height: number;
    width: number;
}) => string;
