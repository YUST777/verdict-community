/**
 * Validates and processes a VideoFrame returned from an onFrame callback
 */
export type OnFrameCallback = (frame: VideoFrame) => VideoFrame | Promise<VideoFrame>;
export type ValidateVideoFrameOptions = {
    originalFrame: VideoFrame;
    returnedFrame: VideoFrame;
    expectedWidth: number;
    expectedHeight: number;
    expectedTimestamp: number;
};
/**
 * Validates that a VideoFrame returned from onFrame callback matches expected dimensions and timestamp
 * If validation fails, closes both frames and throws an error
 */
export declare const validateVideoFrame: ({ originalFrame, returnedFrame, expectedWidth, expectedHeight, expectedTimestamp, }: ValidateVideoFrameOptions) => VideoFrame;
