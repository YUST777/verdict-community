"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMpegFrameLength = exports.getAverageMpegFrameLength = void 0;
const getUnroundedMpegFrameLength = ({ samplesPerFrame, bitrateKbit, samplingFrequency, padding, layer, }) => {
    if (layer === 1) {
        throw new Error('MPEG Layer I is not supported');
    }
    return ((((samplesPerFrame / 8) * bitrateKbit) / samplingFrequency) * 1000 +
        (padding ? (layer === 1 ? 4 : 1) : 0));
};
const getAverageMpegFrameLength = ({ samplesPerFrame, bitrateKbit, samplingFrequency, layer, }) => {
    const withoutPadding = getUnroundedMpegFrameLength({
        bitrateKbit,
        layer,
        padding: false,
        samplesPerFrame,
        samplingFrequency,
    });
    const rounded = Math.floor(withoutPadding);
    const rest = withoutPadding % 1;
    return rest * (rounded + 1) + (1 - rest) * rounded;
};
exports.getAverageMpegFrameLength = getAverageMpegFrameLength;
const getMpegFrameLength = ({ samplesPerFrame, bitrateKbit, samplingFrequency, padding, layer, }) => {
    return Math.floor(getUnroundedMpegFrameLength({
        bitrateKbit,
        layer,
        padding,
        samplesPerFrame,
        samplingFrequency,
    }));
};
exports.getMpegFrameLength = getMpegFrameLength;
