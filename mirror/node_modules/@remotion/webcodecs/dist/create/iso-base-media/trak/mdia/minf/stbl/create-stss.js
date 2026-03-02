"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStss = void 0;
const matroska_utils_1 = require("../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../primitives");
const createStss = (samplePositions) => {
    const samples = samplePositions
        .map((sample, i) => [sample.isKeyframe, i])
        .filter((s) => s[0])
        .map((s) => s[1] + 1);
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('stss'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // entry count
        (0, primitives_1.numberTo32BitUIntOrInt)(samples.length),
        ...samples.map((sample) => (0, primitives_1.numberTo32BitUIntOrInt)(sample)),
    ]));
};
exports.createStss = createStss;
