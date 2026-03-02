"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLoop = void 0;
const check_if_done_1 = require("./check-if-done");
const emit_all_info_1 = require("./emit-all-info");
const log_1 = require("./log");
const make_progress_object_1 = require("./make-progress-object");
const perform_seek_1 = require("./perform-seek");
const run_parse_iteration_1 = require("./run-parse-iteration");
const work_on_seek_request_1 = require("./work-on-seek-request");
const fetchMoreData = async (state) => {
    await state.controller._internals.checkForAbortAndPause();
    const result = await state.currentReader.getCurrent().reader.read();
    if (result.value) {
        state.iterator.addData(result.value);
    }
    return result.done;
};
const parseLoop = async ({ state, throttledState, onError, }) => {
    var _a;
    let iterationWithThisOffset = 0;
    while (!(await (0, check_if_done_1.checkIfDone)(state))) {
        await state.controller._internals.checkForAbortAndPause();
        await (0, work_on_seek_request_1.workOnSeekRequest)((0, work_on_seek_request_1.getWorkOnSeekRequestOptions)(state));
        const offsetBefore = state.iterator.counter.getOffset();
        const readStart = Date.now();
        while (state.iterator.bytesRemaining() < 0) {
            const done = await fetchMoreData(state);
            if (done) {
                break;
            }
        }
        if (iterationWithThisOffset > 0 ||
            state.iterator.bytesRemaining() <= 100000) {
            await fetchMoreData(state);
        }
        state.timings.timeReadingData += Date.now() - readStart;
        (_a = throttledState.update) === null || _a === void 0 ? void 0 : _a.call(throttledState, () => (0, make_progress_object_1.makeProgressObject)(state));
        if (!state.errored) {
            log_1.Log.trace(state.logLevel, `Continuing parsing of file, currently at position ${state.iterator.counter.getOffset()}/${state.contentLength} (0x${state.iterator.counter.getOffset().toString(16)})`);
            if (iterationWithThisOffset > 300 &&
                state.structure.getStructure().type !== 'm3u') {
                throw new Error('Infinite loop detected. The parser is not progressing. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.');
            }
            try {
                await (0, emit_all_info_1.triggerInfoEmit)(state);
                await state.controller._internals.checkForAbortAndPause();
                const parseLoopStart = Date.now();
                const result = await (0, run_parse_iteration_1.runParseIteration)({
                    state,
                });
                state.timings.timeInParseLoop += Date.now() - parseLoopStart;
                if (result !== null && result.action === 'fetch-more-data') {
                    log_1.Log.verbose(state.logLevel, `Need to fetch ${result.bytesNeeded} more bytes before we can continue`);
                    const startBytesRemaining = state.iterator.bytesRemaining();
                    while (true) {
                        const done = await fetchMoreData(state);
                        if (done) {
                            break;
                        }
                        if (state.iterator.bytesRemaining() - startBytesRemaining >=
                            result.bytesNeeded) {
                            break;
                        }
                    }
                    continue;
                }
                if (result !== null && result.action === 'skip') {
                    state.increaseSkippedBytes(result.skipTo - state.iterator.counter.getOffset());
                    if (result.skipTo === state.contentLength) {
                        state.iterator.discard(result.skipTo - state.iterator.counter.getOffset());
                        log_1.Log.verbose(state.logLevel, 'Skipped to end of file, not fetching.');
                        break;
                    }
                    const seekStart = Date.now();
                    await (0, perform_seek_1.performSeek)({
                        seekTo: result.skipTo,
                        userInitiated: false,
                        controller: state.controller,
                        mediaSection: state.mediaSection,
                        iterator: state.iterator,
                        logLevel: state.logLevel,
                        mode: state.mode,
                        contentLength: state.contentLength,
                        seekInfiniteLoop: state.seekInfiniteLoop,
                        currentReader: state.currentReader,
                        readerInterface: state.readerInterface,
                        fields: state.fields,
                        src: state.src,
                        discardReadBytes: state.discardReadBytes,
                        prefetchCache: state.prefetchCache,
                        isoState: state.iso,
                    });
                    state.timings.timeSeeking += Date.now() - seekStart;
                }
            }
            catch (e) {
                const err = await onError(e);
                if (!err.action) {
                    throw new Error('onError was used but did not return an "action" field. See docs for this API on how to use onError.');
                }
                if (err.action === 'fail') {
                    throw e;
                }
                if (err.action === 'download') {
                    state.errored = e;
                    log_1.Log.verbose(state.logLevel, 'Error was handled by onError and deciding to continue.');
                }
            }
        }
        const timeFreeStart = Date.now();
        await state.discardReadBytes(false);
        state.timings.timeFreeingData += Date.now() - timeFreeStart;
        const didProgress = state.iterator.counter.getOffset() > offsetBefore;
        if (!didProgress) {
            iterationWithThisOffset++;
        }
        else {
            iterationWithThisOffset = 0;
        }
    }
    state.samplesObserved.setLastSampleObserved();
    await state.callbacks.callTracksDoneCallback();
    // After the last sample, you might queue a last seek again.
    if (state.controller._internals.seekSignal.getSeek() !== null) {
        log_1.Log.verbose(state.logLevel, 'Reached end of samples, but there is a pending seek. Trying to seek...');
        await (0, work_on_seek_request_1.workOnSeekRequest)((0, work_on_seek_request_1.getWorkOnSeekRequestOptions)(state));
        if (state.controller._internals.seekSignal.getSeek() !== null) {
            throw new Error('Reached the end of the file even though a seek was requested. This is likely a bug in the parser. You can report this at https://remotion.dev/report and we will fix it as soon as possible.');
        }
        await (0, exports.parseLoop)({
            onError,
            throttledState,
            state,
        });
    }
};
exports.parseLoop = parseLoop;
