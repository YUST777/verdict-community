"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIfDone = void 0;
const has_all_info_1 = require("./has-all-info");
const log_1 = require("./log");
const checkIfDone = async (state) => {
    const startCheck = Date.now();
    const hasAll = (0, has_all_info_1.hasAllInfo)({
        state,
    });
    state.timings.timeCheckingIfDone += Date.now() - startCheck;
    if (hasAll && state.mode === 'query') {
        log_1.Log.verbose(state.logLevel, 'Got all info, skipping to the end.');
        state.increaseSkippedBytes(state.contentLength - state.iterator.counter.getOffset());
        return true;
    }
    if (state.iterator.counter.getOffset() === state.contentLength) {
        if (state.structure.getStructure().type === 'm3u' &&
            !state.m3u.getAllChunksProcessedOverall()) {
            return false;
        }
        state.riff.queuedBFrames.flush();
        if (state.riff.queuedBFrames.hasReleasedFrames()) {
            return false;
        }
        log_1.Log.verbose(state.logLevel, 'Reached end of file');
        await state.discardReadBytes(true);
        return true;
    }
    if (state.iterator.counter.getOffset() + state.iterator.bytesRemaining() ===
        state.contentLength &&
        state.errored) {
        log_1.Log.verbose(state.logLevel, 'Reached end of file and errorred');
        return true;
    }
    return false;
};
exports.checkIfDone = checkIfDone;
