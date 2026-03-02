"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riffSpecificState = void 0;
const lazy_idx1_fetch_1 = require("./riff/lazy-idx1-fetch");
const queued_frames_1 = require("./riff/queued-frames");
const sample_counter_1 = require("./riff/sample-counter");
const riffSpecificState = ({ controller, logLevel, readerInterface, src, prefetchCache, contentLength, }) => {
    let avcProfile = null;
    let nextTrackIndex = 0;
    const profileCallbacks = [];
    const registerOnAvcProfileCallback = (callback) => {
        profileCallbacks.push(callback);
    };
    const onProfile = async (profile) => {
        avcProfile = profile;
        for (const callback of profileCallbacks) {
            await callback(profile);
        }
        profileCallbacks.length = 0;
    };
    const lazyIdx1 = (0, lazy_idx1_fetch_1.lazyIdx1Fetch)({
        controller,
        logLevel,
        readerInterface,
        src,
        prefetchCache,
        contentLength,
    });
    const sampleCounter = (0, sample_counter_1.riffSampleCounter)();
    const queuedBFrames = (0, queued_frames_1.queuedBFramesState)();
    return {
        getAvcProfile: () => {
            return avcProfile;
        },
        onProfile,
        registerOnAvcProfileCallback,
        getNextTrackIndex: () => {
            return nextTrackIndex;
        },
        queuedBFrames,
        incrementNextTrackIndex: () => {
            nextTrackIndex++;
        },
        lazyIdx1,
        sampleCounter,
    };
};
exports.riffSpecificState = riffSpecificState;
