"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStsz = void 0;
const matroska_utils_1 = require("../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../primitives");
const createStsz = (samplePositions) => {
    const sampleSizes = samplePositions.map((samplePosition) => samplePosition.size);
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('stsz'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // sample size
        // Possible optimization for the future: If all sizes are the same, we don't have to list them all out
        // https://developer.apple.com/documentation/quicktime-file-format/sample_size_atom
        (0, primitives_1.numberTo32BitUIntOrInt)(0),
        // number of entries
        (0, primitives_1.numberTo32BitUIntOrInt)(sampleSizes.length),
        // sample sizes
        ...sampleSizes.map((size) => (0, primitives_1.numberTo32BitUIntOrInt)(size)),
    ]));
};
exports.createStsz = createStsz;
