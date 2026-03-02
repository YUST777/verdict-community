"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttledStateUpdate = void 0;
const throttledStateUpdate = ({ updateFn, everyMilliseconds, signal, }) => {
    let currentState = {
        decodedAudioFrames: 0,
        decodedVideoFrames: 0,
        encodedVideoFrames: 0,
        encodedAudioFrames: 0,
        bytesWritten: 0,
        millisecondsWritten: 0,
        expectedOutputDurationInMs: null,
        overallProgress: 0,
    };
    if (!updateFn) {
        return {
            get: () => currentState,
            update: null,
            stopAndGetLastProgress: () => { },
        };
    }
    let lastUpdated = null;
    const callUpdateIfChanged = () => {
        if (currentState === lastUpdated) {
            return;
        }
        updateFn(currentState);
        lastUpdated = currentState;
    };
    const interval = setInterval(() => {
        callUpdateIfChanged();
    }, everyMilliseconds);
    const onAbort = () => {
        clearInterval(interval);
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    return {
        get: () => currentState,
        update: (fn) => {
            currentState = fn(currentState);
        },
        stopAndGetLastProgress: () => {
            clearInterval(interval);
            signal?.removeEventListener('abort', onAbort);
            return currentState;
        },
    };
};
exports.throttledStateUpdate = throttledStateUpdate;
