"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNewDimensionsFromRotateAndScale = exports.calculateNewDimensionsFromRotate = void 0;
const calculate_new_size_1 = require("./resizing/calculate-new-size");
const rotate_and_resize_video_frame_1 = require("./rotate-and-resize-video-frame");
const calculateNewDimensionsFromRotate = ({ height, width, rotation, }) => {
    const normalized = (0, rotate_and_resize_video_frame_1.normalizeVideoRotation)(rotation);
    const switchDimensions = normalized % 90 === 0 && normalized % 180 !== 0;
    const newHeight = switchDimensions ? width : height;
    const newWidth = switchDimensions ? height : width;
    return {
        height: newHeight,
        width: newWidth,
    };
};
exports.calculateNewDimensionsFromRotate = calculateNewDimensionsFromRotate;
const calculateNewDimensionsFromRotateAndScale = ({ width, height, rotation, resizeOperation, needsToBeMultipleOfTwo, }) => {
    const { height: newHeight, width: newWidth } = (0, exports.calculateNewDimensionsFromRotate)({
        height,
        rotation,
        width,
    });
    return (0, calculate_new_size_1.calculateNewSizeAfterResizing)({
        dimensions: { height: newHeight, width: newWidth },
        resizeOperation,
        needsToBeMultipleOfTwo,
    });
};
exports.calculateNewDimensionsFromRotateAndScale = calculateNewDimensionsFromRotateAndScale;
