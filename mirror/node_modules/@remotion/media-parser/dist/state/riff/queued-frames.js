"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queuedBFramesState = void 0;
const queuedBFramesState = () => {
    const queuedFrames = [];
    const releasedFrames = [];
    const flush = () => {
        releasedFrames.push(...queuedFrames);
        queuedFrames.length = 0;
    };
    return {
        addFrame: ({ frame, maxFramesInBuffer, trackId, timescale, }) => {
            if (frame.type === 'key') {
                flush();
                releasedFrames.push({ sample: frame, trackId, timescale });
                return;
            }
            queuedFrames.push({ sample: frame, trackId, timescale });
            if (queuedFrames.length > maxFramesInBuffer) {
                releasedFrames.push(queuedFrames.shift());
            }
        },
        flush,
        getReleasedFrame: () => {
            if (releasedFrames.length === 0) {
                return null;
            }
            return releasedFrames.shift();
        },
        hasReleasedFrames: () => {
            return releasedFrames.length > 0;
        },
        clear: () => {
            releasedFrames.length = 0;
            queuedFrames.length = 0;
        },
    };
};
exports.queuedBFramesState = queuedBFramesState;
