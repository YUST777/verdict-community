"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seekInfiniteLoopDetectionState = void 0;
const seekInfiniteLoopDetectionState = () => {
    let lastSeek = null;
    let firstSeekTime = null;
    return {
        registerSeek: (byte) => {
            const now = Date.now();
            if (!lastSeek || lastSeek.byte !== byte) {
                lastSeek = { byte, numberOfTimes: 1 };
                firstSeekTime = now;
                return;
            }
            lastSeek.numberOfTimes++;
            if (lastSeek.numberOfTimes >= 10 &&
                firstSeekTime &&
                now - firstSeekTime <= 2000) {
                throw new Error(`Seeking infinite loop detected: Seeked to byte 0x${byte.toString(16)} ${lastSeek.numberOfTimes} times in a row in the last 2 seconds. Check your usage of .seek().`);
            }
            if (now - firstSeekTime > 2000) {
                lastSeek = { byte, numberOfTimes: 1 };
                firstSeekTime = now;
            }
        },
        reset: () => {
            lastSeek = null;
            firstSeekTime = null;
        },
    };
};
exports.seekInfiniteLoopDetectionState = seekInfiniteLoopDetectionState;
