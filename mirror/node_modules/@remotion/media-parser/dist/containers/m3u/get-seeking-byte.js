"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByteForM3u8 = exports.clearM3uStateInPrepareForSeek = void 0;
const log_1 = require("../../log");
const clearM3uStateInPrepareForSeek = ({ m3uState, logLevel, }) => {
    const selectedPlaylists = m3uState.getSelectedPlaylists();
    for (const playlistUrl of selectedPlaylists) {
        const streamRun = m3uState.getM3uStreamRun(playlistUrl);
        if (streamRun) {
            streamRun.abort();
        }
        log_1.Log.trace(logLevel, 'Clearing M3U stream run for', playlistUrl);
        m3uState.setM3uStreamRun(playlistUrl, null);
    }
    m3uState.clearAllChunksProcessed();
    m3uState.sampleSorter.clearSamples();
};
exports.clearM3uStateInPrepareForSeek = clearM3uStateInPrepareForSeek;
const getSeekingByteForM3u8 = ({ time, currentPosition, m3uState, logLevel, }) => {
    (0, exports.clearM3uStateInPrepareForSeek)({ m3uState, logLevel });
    const selectedPlaylists = m3uState.getSelectedPlaylists();
    for (const playlistUrl of selectedPlaylists) {
        m3uState.setSeekToSecondsToProcess(playlistUrl, {
            targetTime: time,
        });
    }
    return {
        type: 'do-seek',
        byte: currentPosition,
        // TODO: This will be imperfect when seeking in playMedia()
        timeInSeconds: time,
    };
};
exports.getSeekingByteForM3u8 = getSeekingByteForM3u8;
