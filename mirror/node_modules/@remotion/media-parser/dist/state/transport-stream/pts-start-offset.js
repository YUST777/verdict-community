"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ptsStartOffsetStore = void 0;
const ptsStartOffsetStore = () => {
    const offsets = {};
    return {
        getOffset: (trackId) => offsets[trackId] || 0,
        setOffset: ({ newOffset, trackId }) => {
            offsets[trackId] = newOffset;
        },
    };
};
exports.ptsStartOffsetStore = ptsStartOffsetStore;
