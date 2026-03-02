"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttledStateUpdate = void 0;
const throttledStateUpdate = ({ updateFn, everyMilliseconds, controller, }) => {
    let currentState = {
        bytes: 0,
        percentage: null,
        totalBytes: null,
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
    let cleanup = () => { };
    if (everyMilliseconds > 0) {
        const interval = setInterval(() => {
            callUpdateIfChanged();
        }, everyMilliseconds);
        const onAbort = () => {
            clearInterval(interval);
        };
        controller._internals.signal.addEventListener('abort', onAbort, {
            once: true,
        });
        cleanup = () => {
            clearInterval(interval);
            controller._internals.signal.removeEventListener('abort', onAbort);
        };
    }
    return {
        get: () => currentState,
        update: (fn) => {
            currentState = fn(currentState);
            if (everyMilliseconds === 0) {
                callUpdateIfChanged();
            }
        },
        stopAndGetLastProgress: () => {
            cleanup();
            return currentState;
        },
    };
};
exports.throttledStateUpdate = throttledStateUpdate;
