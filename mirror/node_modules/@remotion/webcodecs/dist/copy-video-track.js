"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyVideoTrack = void 0;
const log_1 = require("./log");
const copyVideoTrack = async ({ logLevel, state, track, onMediaStateUpdate, progressTracker, }) => {
    log_1.Log.verbose(logLevel, `Copying video track with codec ${track.codec} and timescale ${track.originalTimescale}`);
    const videoTrack = await state.addTrack({
        type: 'video',
        color: track.advancedColor,
        width: track.codedWidth,
        height: track.codedHeight,
        codec: track.codecEnum,
        codecPrivate: track.codecData?.data ?? null,
        timescale: track.originalTimescale,
    });
    return async (sample) => {
        progressTracker.setPossibleLowestTimestamp(Math.min(sample.timestamp, sample.decodingTimestamp ?? Infinity));
        await state.addSample({
            chunk: sample,
            trackNumber: videoTrack.trackNumber,
            isVideo: true,
            codecPrivate: track.codecData?.data ?? null,
        });
        onMediaStateUpdate?.((prevState) => {
            return {
                ...prevState,
                decodedVideoFrames: prevState.decodedVideoFrames + 1,
            };
        });
    };
};
exports.copyVideoTrack = copyVideoTrack;
