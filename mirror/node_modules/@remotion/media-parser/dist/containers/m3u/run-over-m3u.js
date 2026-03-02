"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOverM3u = void 0;
const log_1 = require("../../log");
const process_m3u_chunk_1 = require("./process-m3u-chunk");
const runOverM3u = async ({ state, structure, playlistUrl, logLevel, }) => {
    const tracksDone = state.m3u.getTrackDone(playlistUrl);
    const hasAudioStreamToConsider = state.m3u.sampleSorter.hasAudioStreamToConsider(playlistUrl);
    const hasVideoStreamToConsider = state.m3u.sampleSorter.hasVideoStreamToConsider(playlistUrl);
    const audioDone = !hasAudioStreamToConsider && tracksDone;
    const videoDone = !hasVideoStreamToConsider && tracksDone;
    const bothDone = audioDone && videoDone;
    if (bothDone) {
        state.m3u.setAllChunksProcessed(playlistUrl);
        return;
    }
    const existingRun = state.m3u.getM3uStreamRun(playlistUrl);
    if (existingRun) {
        log_1.Log.trace(logLevel, 'Existing M3U parsing process found for', playlistUrl);
        const run = await existingRun.continue();
        state.m3u.setM3uStreamRun(playlistUrl, run);
        if (!run) {
            state.m3u.setAllChunksProcessed(playlistUrl);
        }
        return;
    }
    log_1.Log.trace(logLevel, 'Starting new M3U parsing process for', playlistUrl);
    await (0, process_m3u_chunk_1.processM3uChunk)({
        playlistUrl,
        state,
        structure,
        audioDone,
        videoDone,
    });
};
exports.runOverM3u = runOverM3u;
