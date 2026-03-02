"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSamplePositionBounds = void 0;
const getSamplePositionBounds = (samplePositions, timescale) => {
    var _a;
    let min = Infinity;
    let max = -Infinity;
    for (const samplePosition of samplePositions) {
        const timestampMin = Math.min(samplePosition.timestamp, samplePosition.decodingTimestamp);
        const timestampMax = Math.max(samplePosition.timestamp, samplePosition.decodingTimestamp) +
            ((_a = samplePosition.duration) !== null && _a !== void 0 ? _a : 0);
        if (timestampMin < min) {
            min = timestampMin;
        }
        if (timestampMax > max) {
            max = timestampMax;
        }
    }
    return { min: min / timescale, max: max / timescale };
};
exports.getSamplePositionBounds = getSamplePositionBounds;
