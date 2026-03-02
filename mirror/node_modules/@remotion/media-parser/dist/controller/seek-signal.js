"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSeekSignal = void 0;
const makeSeekSignal = (emitter) => {
    let seek = null;
    return {
        seek: (seekRequest) => {
            seek = seekRequest;
            emitter.dispatchSeek(seekRequest);
        },
        getSeek() {
            return seek;
        },
        // In the meanwhile a new seek could have been queued
        clearSeekIfStillSame(previousSeek) {
            if (seek === previousSeek) {
                seek = null;
                return { hasChanged: false };
            }
            return { hasChanged: true };
        },
    };
};
exports.makeSeekSignal = makeSeekSignal;
