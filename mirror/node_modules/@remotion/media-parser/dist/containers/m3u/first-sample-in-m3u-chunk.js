"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.considerSeekBasedOnChunk = void 0;
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const considerSeekBasedOnChunk = async ({ sample, parentController, childController, callback, m3uState, playlistUrl, subtractChunks, chunkIndex, }) => {
    const pendingSeek = m3uState.getSeekToSecondsToProcess(playlistUrl);
    // If there is not even a seek to consider, just call the callback
    if (pendingSeek === null) {
        await callback(sample);
        return;
    }
    const timestamp = Math.min(sample.decodingTimestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE, sample.timestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE);
    // Already too far, now we should go to the previous chunk
    if (timestamp > pendingSeek.targetTime &&
        chunkIndex !== null &&
        chunkIndex > 0) {
        m3uState.setNextSeekShouldSubtractChunks(playlistUrl, subtractChunks + 1);
        parentController.seek(pendingSeek.targetTime);
        return;
    }
    // We are good, we have not gone too far! Don't emit sample and seek and clear pending seek
    childController.seek(pendingSeek.targetTime);
    m3uState.setNextSeekShouldSubtractChunks(playlistUrl, 0);
    m3uState.setSeekToSecondsToProcess(playlistUrl, null);
};
exports.considerSeekBasedOnChunk = considerSeekBasedOnChunk;
