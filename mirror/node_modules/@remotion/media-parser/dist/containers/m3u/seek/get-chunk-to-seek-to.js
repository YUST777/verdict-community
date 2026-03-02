"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChunkToSeekTo = void 0;
const getChunkToSeekTo = ({ chunks, seekToSecondsToProcess, }) => {
    let duration = 0;
    for (let i = 0; i < chunks.length; i++) {
        if (duration >= seekToSecondsToProcess) {
            return Math.max(0, i - 1);
        }
        duration += chunks[i].duration;
    }
    return Math.max(0, chunks.length - 1);
};
exports.getChunkToSeekTo = getChunkToSeekTo;
