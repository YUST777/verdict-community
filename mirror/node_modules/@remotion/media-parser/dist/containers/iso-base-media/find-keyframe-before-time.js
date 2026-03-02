"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findKeyframeBeforeTime = void 0;
const log_1 = require("../../log");
const findKeyframeBeforeTime = ({ samplePositions, time, timescale, mediaSections, logLevel, startInSeconds, }) => {
    let videoByte = 0;
    let videoSample = null;
    for (const sample of samplePositions) {
        const ctsInSeconds = sample.timestamp / timescale + startInSeconds;
        const dtsInSeconds = sample.decodingTimestamp / timescale + startInSeconds;
        if (!sample.isKeyframe) {
            continue;
        }
        if (!(ctsInSeconds <= time || dtsInSeconds <= time)) {
            continue;
        }
        if (videoByte <= sample.offset) {
            videoByte = sample.offset;
            videoSample = sample;
        }
    }
    if (!videoSample) {
        throw new Error('No sample found');
    }
    const mediaSection = mediaSections.find((section) => videoSample.offset >= section.start &&
        videoSample.offset < section.start + section.size);
    if (!mediaSection) {
        log_1.Log.trace(logLevel, 'Found a sample, but the offset has not yet been marked as a video section yet. Not yet able to seek, but probably once we have started reading the next box.', videoSample);
        return null;
    }
    return videoSample;
};
exports.findKeyframeBeforeTime = findKeyframeBeforeTime;
