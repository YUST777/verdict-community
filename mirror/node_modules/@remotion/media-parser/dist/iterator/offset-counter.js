"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOffsetCounter = void 0;
const makeOffsetCounter = (initial) => {
    let offset = initial;
    let discardedBytes = 0;
    return {
        getOffset: () => offset,
        discardBytes: (bytes) => {
            discardedBytes += bytes;
        },
        increment: (bytes) => {
            if (bytes < 0) {
                throw new Error('Cannot increment by a negative amount: ' + bytes);
            }
            offset += bytes;
        },
        getDiscardedBytes: () => discardedBytes,
        setDiscardedOffset: (bytes) => {
            discardedBytes = bytes;
        },
        getDiscardedOffset: () => offset - discardedBytes,
        decrement: (bytes) => {
            if (bytes < 0) {
                throw new Error('Cannot decrement by a negative amount: ' + bytes);
            }
            offset -= bytes;
        },
    };
};
exports.makeOffsetCounter = makeOffsetCounter;
