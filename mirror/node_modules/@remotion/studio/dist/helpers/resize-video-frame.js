"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeVideoFrame = void 0;
const calculateNewDimensionsFromScale = ({ width, height, scale, }) => {
    const scaledWidth = Math.round(width * scale);
    const scaledHeight = Math.round(height * scale);
    return {
        width: scaledWidth,
        height: scaledHeight,
    };
};
const resizeVideoFrame = ({ frame, scale, }) => {
    var _a;
    // No resize, no rotation
    if (scale === 1) {
        return frame;
    }
    const { width, height } = calculateNewDimensionsFromScale({
        height: frame.displayHeight,
        width: frame.displayWidth,
        scale,
    });
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2d context');
    }
    canvas.width = width;
    canvas.height = height;
    ctx.scale(scale, scale);
    ctx.drawImage(frame, 0, 0);
    return new VideoFrame(canvas, {
        displayHeight: height,
        displayWidth: width,
        duration: (_a = frame.duration) !== null && _a !== void 0 ? _a : undefined,
        timestamp: frame.timestamp,
    });
};
exports.resizeVideoFrame = resizeVideoFrame;
