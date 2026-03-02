"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFrame = void 0;
const browser_quirks_1 = require("./browser-quirks");
const convert_to_correct_videoframe_1 = require("./convert-to-correct-videoframe");
const rotate_and_resize_video_frame_1 = require("./rotate-and-resize-video-frame");
const processFrame = async ({ frame: unrotatedFrame, onVideoFrame, track, outputCodec, rotation, resizeOperation, }) => {
    const rotated = (0, rotate_and_resize_video_frame_1.rotateAndResizeVideoFrame)({
        rotation,
        frame: unrotatedFrame,
        resizeOperation,
        needsToBeMultipleOfTwo: outputCodec === 'h264',
    });
    if (unrotatedFrame !== rotated) {
        unrotatedFrame.close();
    }
    const userProcessedFrame = onVideoFrame
        ? await onVideoFrame({ frame: rotated, track })
        : rotated;
    if (userProcessedFrame.displayWidth !== rotated.displayWidth) {
        throw new Error(`Returned VideoFrame of track ${track.trackId} has different displayWidth (${userProcessedFrame.displayWidth}) than the input frame (${rotated.displayWidth})`);
    }
    if (userProcessedFrame.displayHeight !== rotated.displayHeight) {
        throw new Error(`Returned VideoFrame of track ${track.trackId} has different displayHeight (${userProcessedFrame.displayHeight}) than the input frame (${rotated.displayHeight})`);
    }
    // In Safari, calling new VideoFrame() might change the timestamp
    // In flipVideo test from 803000 to 803299
    if (userProcessedFrame.timestamp !== rotated.timestamp && !(0, browser_quirks_1.isSafari)()) {
        throw new Error(`Returned VideoFrame of track ${track.trackId} has different timestamp (${userProcessedFrame.timestamp}) than the input frame (${rotated.timestamp}). When calling new VideoFrame(), pass {timestamp: frame.timestamp} as second argument`);
    }
    if ((userProcessedFrame.duration ?? 0) !== (rotated.duration ?? 0)) {
        throw new Error(`Returned VideoFrame of track ${track.trackId} has different duration (${userProcessedFrame.duration}) than the input frame (${rotated.duration}). When calling new VideoFrame(), pass {duration: frame.duration} as second argument`);
    }
    if (rotated !== userProcessedFrame) {
        rotated.close();
    }
    const fixedFrame = (0, convert_to_correct_videoframe_1.convertToCorrectVideoFrame)({
        videoFrame: userProcessedFrame,
        outputCodec,
    });
    if (fixedFrame !== userProcessedFrame) {
        userProcessedFrame.close();
    }
    return fixedFrame;
};
exports.processFrame = processFrame;
