"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyAudioTrack = void 0;
const log_1 = require("./log");
const copyAudioTrack = async ({ state, track, logLevel, onMediaStateUpdate, progressTracker, }) => {
    const addedTrack = await state.addTrack({
        type: 'audio',
        codec: track.codecEnum,
        numberOfChannels: track.numberOfChannels,
        sampleRate: track.sampleRate,
        codecPrivate: track.codecData?.data ?? null,
        timescale: track.originalTimescale,
    });
    log_1.Log.verbose(logLevel, `Copying audio track ${track.trackId} as track ${addedTrack.trackNumber}. Timescale = ${track.originalTimescale}, codec = ${track.codecEnum} (${track.codec}) `);
    return async (audioSample) => {
        progressTracker.setPossibleLowestTimestamp(Math.min(audioSample.timestamp, audioSample.decodingTimestamp ?? Infinity));
        await state.addSample({
            chunk: audioSample,
            trackNumber: addedTrack.trackNumber,
            isVideo: false,
            codecPrivate: track.codecData?.data ?? null,
        });
        onMediaStateUpdate?.((prevState) => {
            return {
                ...prevState,
                encodedAudioFrames: prevState.encodedAudioFrames + 1,
            };
        });
    };
};
exports.copyAudioTrack = copyAudioTrack;
