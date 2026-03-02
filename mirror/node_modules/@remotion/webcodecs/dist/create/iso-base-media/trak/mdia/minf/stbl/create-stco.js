"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStcoAtom = void 0;
const matroska_utils_1 = require("../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../primitives");
const createStcoAtom = (samplePositions) => {
    const chunkOffsets = [];
    let lastChunk;
    let needs64Bit = false;
    for (const sample of samplePositions) {
        if (lastChunk !== sample.chunk) {
            chunkOffsets.push(sample.offset);
        }
        if (sample.offset > 2 ** 32) {
            needs64Bit = true;
        }
        lastChunk = sample.chunk;
    }
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)(needs64Bit ? 'co64' : 'stco'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // number of entries
        (0, primitives_1.numberTo32BitUIntOrInt)(chunkOffsets.length),
        // chunk offsets
        (0, matroska_utils_1.combineUint8Arrays)(chunkOffsets.map((offset) => needs64Bit
            ? (0, primitives_1.numberTo64BitUIntOrInt)(offset)
            : (0, primitives_1.numberTo32BitUIntOrInt)(offset))),
    ]));
};
exports.createStcoAtom = createStcoAtom;
