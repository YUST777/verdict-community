"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStsc = void 0;
const matroska_utils_1 = require("../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../primitives");
const createEntry = (entry) => {
    return (0, matroska_utils_1.combineUint8Arrays)([
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.firstChunk),
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.samplesPerChunk),
        (0, primitives_1.numberTo32BitUIntOrInt)(entry.sampleDescriptionIndex),
    ]);
};
const createStsc = (samplePositions) => {
    const entries = [];
    const deduplicateLastEntry = () => {
        const lastEntry = entries[entries.length - 1];
        const secondToLastEntry = entries[entries.length - 2];
        if (lastEntry &&
            secondToLastEntry &&
            lastEntry.samplesPerChunk === secondToLastEntry.samplesPerChunk &&
            lastEntry.sampleDescriptionIndex ===
                secondToLastEntry.sampleDescriptionIndex) {
            const lastIndex = entries.length - 1;
            entries.length = lastIndex;
        }
    };
    let lastChunk;
    for (const samplePosition of samplePositions) {
        if (samplePosition.chunk === lastChunk) {
            entries[entries.length - 1].samplesPerChunk++;
        }
        else {
            deduplicateLastEntry();
            entries.push({
                firstChunk: samplePosition.chunk,
                samplesPerChunk: 1,
                sampleDescriptionIndex: 1,
            });
            lastChunk = samplePosition.chunk;
        }
    }
    deduplicateLastEntry();
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('stsc'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // entry count
        (0, primitives_1.numberTo32BitUIntOrInt)(entries.length),
        // entries
        ...entries.map((e) => createEntry(e)),
    ]));
};
exports.createStsc = createStsc;
