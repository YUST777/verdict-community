"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.samplesObservedState = void 0;
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const samplesObservedState = () => {
    let smallestVideoSample;
    let largestVideoSample;
    let smallestAudioSample;
    let largestAudioSample;
    let lastSampleObserved = false;
    const videoSamples = new Map();
    const audioSamples = new Map();
    const getSlowVideoDurationInSeconds = () => {
        return (largestVideoSample !== null && largestVideoSample !== void 0 ? largestVideoSample : 0) - (smallestVideoSample !== null && smallestVideoSample !== void 0 ? smallestVideoSample : 0);
    };
    const getSlowAudioDurationInSeconds = () => {
        return (largestAudioSample !== null && largestAudioSample !== void 0 ? largestAudioSample : 0) - (smallestAudioSample !== null && smallestAudioSample !== void 0 ? smallestAudioSample : 0);
    };
    const getSlowDurationInSeconds = () => {
        const smallestSample = Math.min(smallestAudioSample !== null && smallestAudioSample !== void 0 ? smallestAudioSample : Infinity, smallestVideoSample !== null && smallestVideoSample !== void 0 ? smallestVideoSample : Infinity);
        const largestSample = Math.max(largestAudioSample !== null && largestAudioSample !== void 0 ? largestAudioSample : 0, largestVideoSample !== null && largestVideoSample !== void 0 ? largestVideoSample : 0);
        if (smallestSample === Infinity || largestSample === Infinity) {
            return 0;
        }
        return largestSample - smallestSample;
    };
    const addVideoSample = (videoSample) => {
        var _a;
        videoSamples.set(videoSample.timestamp, videoSample.data.byteLength);
        const presentationTimeInSeconds = videoSample.timestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE;
        const duration = ((_a = videoSample.duration) !== null && _a !== void 0 ? _a : 0) / webcodecs_timescale_1.WEBCODECS_TIMESCALE;
        if (largestVideoSample === undefined ||
            presentationTimeInSeconds > largestVideoSample) {
            largestVideoSample = presentationTimeInSeconds + duration;
        }
        if (smallestVideoSample === undefined ||
            presentationTimeInSeconds < smallestVideoSample) {
            smallestVideoSample = presentationTimeInSeconds;
        }
    };
    const addAudioSample = (audioSample) => {
        var _a;
        audioSamples.set(audioSample.timestamp, audioSample.data.byteLength);
        const presentationTimeInSeconds = audioSample.timestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE;
        const duration = ((_a = audioSample.duration) !== null && _a !== void 0 ? _a : 0) / webcodecs_timescale_1.WEBCODECS_TIMESCALE;
        if (largestAudioSample === undefined ||
            presentationTimeInSeconds > largestAudioSample) {
            largestAudioSample = presentationTimeInSeconds + duration;
        }
        if (smallestAudioSample === undefined ||
            presentationTimeInSeconds < smallestAudioSample) {
            smallestAudioSample = presentationTimeInSeconds;
        }
    };
    const getFps = () => {
        const videoDuration = (largestVideoSample !== null && largestVideoSample !== void 0 ? largestVideoSample : 0) - (smallestVideoSample !== null && smallestVideoSample !== void 0 ? smallestVideoSample : 0);
        if (videoDuration === 0) {
            return 0;
        }
        return (videoSamples.size - 1) / videoDuration;
    };
    const getSlowNumberOfFrames = () => videoSamples.size;
    const getAudioBitrate = () => {
        const audioDuration = getSlowAudioDurationInSeconds();
        if (audioDuration === 0 || audioSamples.size === 0) {
            return null;
        }
        const audioSizesInBytes = Array.from(audioSamples.values()).reduce((acc, size) => acc + size, 0);
        return (audioSizesInBytes * 8) / audioDuration;
    };
    const getVideoBitrate = () => {
        const videoDuration = getSlowVideoDurationInSeconds();
        if (videoDuration === 0 || videoSamples.size === 0) {
            return null;
        }
        const videoSizesInBytes = Array.from(videoSamples.values()).reduce((acc, size) => acc + size, 0);
        return (videoSizesInBytes * 8) / videoDuration;
    };
    const getLastSampleObserved = () => lastSampleObserved;
    const setLastSampleObserved = () => {
        lastSampleObserved = true;
    };
    return {
        addVideoSample,
        addAudioSample,
        getSlowDurationInSeconds,
        getFps,
        getSlowNumberOfFrames,
        getAudioBitrate,
        getVideoBitrate,
        getLastSampleObserved,
        setLastSampleObserved,
        getAmountOfSamplesObserved: () => videoSamples.size + audioSamples.size,
    };
};
exports.samplesObservedState = samplesObservedState;
