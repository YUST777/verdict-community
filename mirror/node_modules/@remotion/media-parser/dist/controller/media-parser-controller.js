"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaParserController = void 0;
const errors_1 = require("../errors");
const emitter_1 = require("./emitter");
const pause_signal_1 = require("./pause-signal");
const performed_seeks_stats_1 = require("./performed-seeks-stats");
const seek_signal_1 = require("./seek-signal");
const mediaParserController = () => {
    const abortController = new AbortController();
    const emitter = new emitter_1.MediaParserEmitter();
    const pauseSignal = (0, pause_signal_1.makePauseSignal)(emitter);
    const seekSignal = (0, seek_signal_1.makeSeekSignal)(emitter);
    const performedSeeksSignal = (0, performed_seeks_stats_1.performedSeeksStats)();
    const checkForAbortAndPause = async () => {
        if (abortController.signal.aborted) {
            const err = new errors_1.MediaParserAbortError('Aborted');
            if (abortController.signal.reason) {
                err.cause = abortController.signal.reason;
            }
            throw err;
        }
        await pauseSignal.waitUntilResume();
    };
    let seekingHintResolution = null;
    let simulateSeekResolution = null;
    const getSeekingHints = () => {
        if (!seekingHintResolution) {
            throw new Error('The mediaParserController() was not yet used in a parseMedia() call');
        }
        return seekingHintResolution();
    };
    const simulateSeek = (seekInSeconds) => {
        if (!simulateSeekResolution) {
            throw new Error('The mediaParserController() was not yet used in a parseMedia() call');
        }
        return simulateSeekResolution(seekInSeconds);
    };
    const attachSeekingHintResolution = (callback) => {
        if (seekingHintResolution) {
            throw new Error('The mediaParserController() was used in multiple parseMedia() calls. Create a separate controller for each call.');
        }
        seekingHintResolution = callback;
    };
    const attachSimulateSeekResolution = (callback) => {
        if (simulateSeekResolution) {
            throw new Error('The mediaParserController() was used in multiple parseMedia() calls. Create a separate controller for each call.');
        }
        simulateSeekResolution = callback;
    };
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        abort: (reason) => {
            abortController.abort(reason);
            emitter.dispatchAbort(reason);
        },
        seek: seekSignal.seek,
        simulateSeek,
        pause: pauseSignal.pause,
        resume: pauseSignal.resume,
        addEventListener: emitter.addEventListener,
        removeEventListener: emitter.removeEventListener,
        getSeekingHints,
        _internals: {
            signal: abortController.signal,
            checkForAbortAndPause,
            seekSignal,
            markAsReadyToEmitEvents: emitter.markAsReady,
            performedSeeksSignal,
            attachSeekingHintResolution,
            attachSimulateSeekResolution,
        },
    };
};
exports.mediaParserController = mediaParserController;
