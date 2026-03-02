"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCttsBox = void 0;
const matroska_utils_1 = require("../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../primitives");
const makeEntry = (entry) => {
    return (0, matroska_utils_1.combineUint8Arrays)([
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.sampleCount),
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.sampleOffset),
    ]);
};
const createCttsBox = (samplePositions) => {
    const offsets = samplePositions.map((s) => s.timestamp - s.decodingTimestamp);
    const entries = [];
    let lastOffset = null;
    for (const offset of offsets) {
        if (lastOffset === offset) {
            entries[entries.length - 1].sampleCount++;
        }
        else {
            entries.push({
                sampleCount: 1,
                sampleOffset: offset,
            });
        }
        lastOffset = offset;
    }
    const needsCtts = entries.length > 0 && entries.some((e) => e.sampleOffset !== 0);
    if (!needsCtts) {
        return null;
    }
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('ctts'),
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
exports.createCttsBox = createCttsBox;
