export declare const getVideoEncoderConfig: ({ codec, height, width, fps, }: {
    width: number;
    height: number;
    codec: "h264" | "h265" | "vp8" | "vp9";
    fps: number | null;
}) => Promise<VideoEncoderConfig | null>;
