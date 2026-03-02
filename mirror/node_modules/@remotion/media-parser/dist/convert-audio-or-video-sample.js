"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAudioOrVideoSampleToWebCodecsTimestamps = void 0;
const webcodecs_timescale_1 = require("./webcodecs-timescale");
const fixFloat = (value) => {
    if (value % 1 < 0.0000001) {
        return Math.floor(value);
    }
    if (value % 1 > 0.9999999) {
        return Math.ceil(value);
    }
    return value;
};
const convertAudioOrVideoSampleToWebCodecsTimestamps = ({ sample, timescale, }) => {
    if (timescale === webcodecs_timescale_1.WEBCODECS_TIMESCALE) {
        return sample;
    }
    const { decodingTimestamp: dts, timestamp } = sample;
    return {
        decodingTimestamp: fixFloat(dts * (webcodecs_timescale_1.WEBCODECS_TIMESCALE / timescale)),
        timestamp: fixFloat(timestamp * (webcodecs_timescale_1.WEBCODECS_TIMESCALE / timescale)),
        duration: sample.duration === undefined
            ? undefined
            : fixFloat(sample.duration * (webcodecs_timescale_1.WEBCODECS_TIMESCALE / timescale)),
        data: sample.data,
        type: sample.type,
        offset: sample.offset,
        ...('avc' in sample ? { avc: sample.avc } : {}),
    };
};
exports.convertAudioOrVideoSampleToWebCodecsTimestamps = convertAudioOrVideoSampleToWebCodecsTimestamps;
