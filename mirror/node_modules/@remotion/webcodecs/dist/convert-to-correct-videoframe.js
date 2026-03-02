"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCorrectVideoFrame = exports.needsToCorrectVideoFrame = void 0;
const browser_quirks_1 = require("./browser-quirks");
const needsToCorrectVideoFrame = ({ videoFrame, outputCodec, }) => {
    // On Chrome when dropping a vertical iPhone video
    if (videoFrame.format === null) {
        return true;
    }
    // copy8f9178c2-e8ab-4538-9591-f8336602e49b-3mp4 - HDR videos
    if (videoFrame.format === 'I420P10') {
        return true;
    }
    return (0, browser_quirks_1.isFirefox)() && videoFrame.format === 'BGRX' && outputCodec === 'h264';
};
exports.needsToCorrectVideoFrame = needsToCorrectVideoFrame;
const convertToCorrectVideoFrame = ({ videoFrame, outputCodec, }) => {
    if (!(0, exports.needsToCorrectVideoFrame)({ videoFrame, outputCodec })) {
        return videoFrame;
    }
    const canvas = new OffscreenCanvas(videoFrame.displayWidth, videoFrame.displayHeight);
    canvas.width = videoFrame.displayWidth;
    canvas.height = videoFrame.displayHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2d context');
    }
    ctx.drawImage(videoFrame, 0, 0);
    return new VideoFrame(canvas, {
        displayHeight: videoFrame.displayHeight,
        displayWidth: videoFrame.displayWidth,
        duration: videoFrame.duration,
        timestamp: videoFrame.timestamp,
    });
};
exports.convertToCorrectVideoFrame = convertToCorrectVideoFrame;
