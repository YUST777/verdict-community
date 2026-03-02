"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateAndResizeVideoFrame = exports.normalizeVideoRotation = void 0;
const rotation_1 = require("./rotation");
const normalizeVideoRotation = (rotation) => {
    return ((rotation % 360) + 360) % 360;
};
exports.normalizeVideoRotation = normalizeVideoRotation;
const rotateAndResizeVideoFrame = ({ frame, rotation, needsToBeMultipleOfTwo = false, resizeOperation, }) => {
    const normalized = (0, exports.normalizeVideoRotation)(rotation);
    // In Chrome, there is "rotation", but we cannot put frames with VideoEncoder if they have a rotation.
    // We have to draw them to a canvas and make a new frame without video rotation.
    const mustProcess = 'rotation' in frame && frame.rotation !== 0;
    // No resize, no rotation
    if (normalized === 0 && resizeOperation === null && !mustProcess) {
        return frame;
    }
    if (normalized % 90 !== 0) {
        throw new Error('Only 90 degree rotations are supported');
    }
    const tentativeDimensions = (0, rotation_1.calculateNewDimensionsFromRotateAndScale)({
        height: frame.displayHeight,
        width: frame.displayWidth,
        rotation,
        needsToBeMultipleOfTwo,
        resizeOperation,
    });
    // No rotation, and resize turned out to be same dimensions
    if (normalized === 0 &&
        tentativeDimensions.height === frame.displayHeight &&
        tentativeDimensions.width === frame.displayWidth &&
        !mustProcess) {
        return frame;
    }
    const canvasRotationToApply = (0, exports.normalizeVideoRotation)(normalized);
    const { width, height } = (0, rotation_1.calculateNewDimensionsFromRotateAndScale)({
        height: frame.displayHeight,
        width: frame.displayWidth,
        rotation: canvasRotationToApply,
        needsToBeMultipleOfTwo,
        resizeOperation,
    });
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2d context');
    }
    canvas.width = width;
    canvas.height = height;
    if (canvasRotationToApply === 90) {
        ctx.translate(width, 0);
    }
    else if (canvasRotationToApply === 180) {
        ctx.translate(width, height);
    }
    else if (canvasRotationToApply === 270) {
        ctx.translate(0, height);
    }
    if (canvasRotationToApply !== 0) {
        ctx.rotate(canvasRotationToApply * (Math.PI / 180));
    }
    if (frame.displayHeight !== height || frame.displayWidth !== width) {
        const dimensionsAfterRotate = (0, rotation_1.calculateNewDimensionsFromRotate)({
            height: frame.displayHeight,
            rotation: canvasRotationToApply,
            width: frame.displayWidth,
        });
        ctx.scale(width / dimensionsAfterRotate.width, height / dimensionsAfterRotate.height);
    }
    ctx.drawImage(frame, 0, 0);
    return new VideoFrame(canvas, {
        displayHeight: height,
        displayWidth: width,
        duration: frame.duration ?? undefined,
        timestamp: frame.timestamp,
    });
};
exports.rotateAndResizeVideoFrame = rotateAndResizeVideoFrame;
