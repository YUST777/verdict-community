"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleSorter = void 0;
const log_1 = require("../../log");
const sampleSorter = ({ logLevel, getAllChunksProcessedForPlaylist, }) => {
    const streamsWithTracks = [];
    const audioCallbacks = {};
    const videoCallbacks = {};
    let latestSample = {};
    return {
        clearSamples: () => {
            latestSample = {};
        },
        addToStreamWithTrack: (src) => {
            streamsWithTracks.push(src);
        },
        addVideoStreamToConsider: (src, callback) => {
            videoCallbacks[src] = callback;
        },
        addAudioStreamToConsider: (src, callback) => {
            audioCallbacks[src] = callback;
        },
        hasAudioStreamToConsider: (src) => {
            return Boolean(audioCallbacks[src]);
        },
        hasVideoStreamToConsider: (src) => {
            return Boolean(videoCallbacks[src]);
        },
        addAudioSample: async (src, sample) => {
            const callback = audioCallbacks[src];
            if (!callback) {
                throw new Error('No callback found for audio sample');
            }
            latestSample[src] = sample.decodingTimestamp;
            await callback(sample);
        },
        addVideoSample: async (src, sample) => {
            const callback = videoCallbacks[src];
            if (!callback) {
                throw new Error('No callback found for video sample.');
            }
            latestSample[src] = sample.decodingTimestamp;
            await callback(sample);
        },
        getNextStreamToRun: (streams) => {
            var _a, _b, _c;
            for (const stream of streams) {
                if (getAllChunksProcessedForPlaylist(stream)) {
                    continue;
                }
                // If a stream does not have a track yet, work on that
                if (!streamsWithTracks.includes(stream)) {
                    log_1.Log.trace(logLevel, `Did not yet detect track of ${stream}, working on that`);
                    return stream;
                }
            }
            let smallestDts = Infinity;
            for (const stream of streams) {
                if (getAllChunksProcessedForPlaylist(stream)) {
                    continue;
                }
                if (((_a = latestSample[stream]) !== null && _a !== void 0 ? _a : 0) < smallestDts) {
                    smallestDts = (_b = latestSample[stream]) !== null && _b !== void 0 ? _b : 0;
                }
            }
            for (const stream of streams) {
                if (getAllChunksProcessedForPlaylist(stream)) {
                    continue;
                }
                if (((_c = latestSample[stream]) !== null && _c !== void 0 ? _c : 0) === smallestDts) {
                    log_1.Log.trace(logLevel, `Working on ${stream} because it has the smallest DTS`);
                    return stream;
                }
            }
            throw new Error('should be done with parsing now');
        },
    };
};
exports.sampleSorter = sampleSorter;
