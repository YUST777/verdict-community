"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.needsToIterateOverEverySample = exports.needsToIterateOverSamples = exports.fieldsNeedSamplesMap = void 0;
exports.fieldsNeedSamplesMap = {
    slowDurationInSeconds: true,
    slowFps: true,
    slowKeyframes: true,
    slowNumberOfFrames: true,
    audioCodec: false,
    container: false,
    dimensions: false,
    durationInSeconds: false,
    fps: false,
    internalStats: false,
    isHdr: false,
    name: false,
    rotation: false,
    size: false,
    slowStructure: false,
    tracks: false,
    unrotatedDimensions: false,
    videoCodec: false,
    metadata: false,
    location: false,
    mimeType: false,
    keyframes: false,
    images: false,
    numberOfAudioChannels: false,
    sampleRate: false,
    slowAudioBitrate: true,
    slowVideoBitrate: true,
    m3uStreams: false,
};
const needsToIterateOverSamples = ({ fields, emittedFields, }) => {
    const keys = Object.keys(fields !== null && fields !== void 0 ? fields : {});
    const selectedKeys = keys.filter((k) => fields[k]);
    return selectedKeys.some((k) => exports.fieldsNeedSamplesMap[k] && !emittedFields[k]);
};
exports.needsToIterateOverSamples = needsToIterateOverSamples;
// For duration, we only need the first and last sample
const fieldsNeedEverySampleMap = {
    ...exports.fieldsNeedSamplesMap,
    slowDurationInSeconds: false,
};
const needsToIterateOverEverySample = ({ fields, emittedFields, }) => {
    const keys = Object.keys(fields !== null && fields !== void 0 ? fields : {});
    const selectedKeys = keys.filter((k) => fields[k]);
    return selectedKeys.some((k) => fieldsNeedEverySampleMap[k] && !emittedFields[k]);
};
exports.needsToIterateOverEverySample = needsToIterateOverEverySample;
