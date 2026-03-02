"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBestSegmentFromTfra = void 0;
const findBestSegmentFromTfra = ({ mfra, time, firstTrack, timescale, }) => {
    const tfra = mfra.find((b) => b.type === 'tfra-box' && b.trackId === firstTrack.trackId);
    if (!tfra) {
        return null;
    }
    let bestSegment = null;
    for (const segment of tfra.entries) {
        if (segment.time / timescale <= time) {
            bestSegment = segment;
        }
    }
    if (!bestSegment) {
        return null;
    }
    const currentSegmentIndex = tfra.entries.indexOf(bestSegment);
    const offsetOfNext = currentSegmentIndex === tfra.entries.length - 1
        ? Infinity
        : tfra.entries[currentSegmentIndex + 1].moofOffset;
    return {
        start: bestSegment.moofOffset,
        end: offsetOfNext,
    };
};
exports.findBestSegmentFromTfra = findBestSegmentFromTfra;
