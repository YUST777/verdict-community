"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSttsAtom = void 0;
const matroska_utils_1 = require("../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../primitives");
const makeEntry = (entry) => {
    if (entry.sampleOffset < 0) {
        throw new Error('negative sample offset in stts ' + entry.sampleOffset);
    }
    return (0, matroska_utils_1.combineUint8Arrays)([
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.sampleCount),
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.sampleOffset),
    ]);
};
const createSttsAtom = (samplePositions) => {
    let lastDuration = null;
    const durations = samplePositions.map((_, i, a) => {
        // TODO: Why does 0 appear here?
        if (a[i].duration === undefined || a[i].duration === 0) {
            if (a[i + 1] === undefined) {
                return (a[i].decodingTimestamp -
                    (a[i - 1]?.decodingTimestamp ?? a[i].decodingTimestamp));
            }
            return a[i + 1].decodingTimestamp - a[i].decodingTimestamp;
        }
        return a[i].duration;
    });
    const entries = [];
    for (const duration of durations) {
        if (duration === lastDuration) {
            entries[entries.length - 1].sampleCount++;
        }
        else {
            entries.push({
                sampleCount: 1,
                sampleOffset: duration,
            });
        }
        lastDuration = duration;
    }
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('stts'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // entry count
        (0, primitives_1.numberTo32BitUIntOrInt)(entries.length),
        // entries
        ...entries.map((e) => makeEntry(e)),
    ]));
};
exports.createSttsAtom = createSttsAtom;
