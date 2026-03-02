"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEvenDimensionsWithCodec = void 0;
const logger_1 = require("./logger");
const validateEvenDimensionsWithCodec = ({ width, height, codec, scale, wantsImageSequence, indent, logLevel, }) => {
    if (wantsImageSequence) {
        return {
            actualWidth: width,
            actualHeight: height,
        };
    }
    if (codec !== 'h264-mkv' &&
        codec !== 'h264' &&
        codec !== 'h265' &&
        codec !== 'h264-ts') {
        return {
            actualWidth: width,
            actualHeight: height,
        };
    }
    let heightEvenDimensions = height;
    while (Math.round(heightEvenDimensions * scale) % 2 !== 0) {
        heightEvenDimensions--;
    }
    let widthEvenDimensions = width;
    while (Math.round(widthEvenDimensions * scale) % 2 !== 0) {
        widthEvenDimensions--;
    }
    if (widthEvenDimensions !== width) {
        logger_1.Log.verbose({ indent, logLevel }, `Rounding width to an even number from ${width} to ${widthEvenDimensions}`);
    }
    if (heightEvenDimensions !== height) {
        logger_1.Log.verbose({ indent, logLevel }, `Rounding height to an even number from ${height} to ${heightEvenDimensions}`);
    }
    return {
        actualWidth: widthEvenDimensions,
        actualHeight: heightEvenDimensions,
    };
};
exports.validateEvenDimensionsWithCodec = validateEvenDimensionsWithCodec;
