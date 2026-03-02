"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riffSampleCounter = void 0;
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const riff_keyframes_1 = require("./riff-keyframes");
const riffSampleCounter = () => {
    const samplesForTrack = {};
    // keyframe offset -> poc[]
    const pocsAtKeyframeOffset = {};
    const riffKeys = (0, riff_keyframes_1.riffKeyframesState)();
    const onAudioSample = (trackId, audioSample) => {
        if (typeof samplesForTrack[trackId] === 'undefined') {
            samplesForTrack[trackId] = 0;
        }
        if (audioSample.data.length > 0) {
            samplesForTrack[trackId]++;
        }
        samplesForTrack[trackId]++;
    };
    const onVideoSample = ({ trackId, videoSample, }) => {
        if (typeof samplesForTrack[trackId] === 'undefined') {
            samplesForTrack[trackId] = 0;
        }
        if (videoSample.type === 'key') {
            riffKeys.addKeyframe({
                trackId,
                decodingTimeInSeconds: videoSample.decodingTimestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE,
                positionInBytes: videoSample.offset,
                presentationTimeInSeconds: videoSample.timestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE,
                sizeInBytes: videoSample.data.length,
                sampleCounts: { ...samplesForTrack },
            });
        }
        if (videoSample.data.length > 0) {
            samplesForTrack[trackId]++;
        }
    };
    const getSampleCountForTrack = ({ trackId }) => {
        var _a;
        return (_a = samplesForTrack[trackId]) !== null && _a !== void 0 ? _a : 0;
    };
    const setSamplesFromSeek = (samples) => {
        for (const trackId in samples) {
            samplesForTrack[trackId] = samples[trackId];
        }
    };
    const setPocAtKeyframeOffset = ({ keyframeOffset, poc, }) => {
        if (typeof pocsAtKeyframeOffset[keyframeOffset] === 'undefined') {
            pocsAtKeyframeOffset[keyframeOffset] = [];
        }
        if (pocsAtKeyframeOffset[keyframeOffset].includes(poc)) {
            return;
        }
        pocsAtKeyframeOffset[keyframeOffset].push(poc);
        pocsAtKeyframeOffset[keyframeOffset].sort((a, b) => a - b);
    };
    const getPocAtKeyframeOffset = ({ keyframeOffset, }) => {
        return pocsAtKeyframeOffset[keyframeOffset];
    };
    const getKeyframeAtOffset = (sample) => {
        var _a, _b;
        if (sample.type === 'key') {
            return sample.offset;
        }
        return ((_b = (_a = riffKeys
            .getKeyframes()
            .findLast((k) => k.positionInBytes <= sample.offset)) === null || _a === void 0 ? void 0 : _a.positionInBytes) !== null && _b !== void 0 ? _b : null);
    };
    return {
        onAudioSample,
        onVideoSample,
        getSampleCountForTrack,
        setSamplesFromSeek,
        riffKeys,
        setPocAtKeyframeOffset,
        getPocAtKeyframeOffset,
        getKeyframeAtOffset,
    };
};
exports.riffSampleCounter = riffSampleCounter;
