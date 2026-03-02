export declare const needsToCorrectVideoFrame: ({ videoFrame, outputCodec, }: {
    videoFrame: VideoFrame;
    outputCodec: "h264" | "h265" | "vp8" | "vp9";
}) => boolean;
export declare const convertToCorrectVideoFrame: ({ videoFrame, outputCodec, }: {
    videoFrame: VideoFrame;
    outputCodec: "h264" | "h265" | "vp8" | "vp9";
}) => VideoFrame;
