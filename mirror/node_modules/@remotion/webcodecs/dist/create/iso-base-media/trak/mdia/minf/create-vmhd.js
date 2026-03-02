"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVmhd = void 0;
const matroska_utils_1 = require("../../../../matroska/matroska-utils");
const primitives_1 = require("../../../primitives");
const createVmhd = () => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('vmhd'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 1]),
        // graphics mode, 0 = copy
        new Uint8Array([0, 0]),
        // opcolor
        new Uint8Array([0, 0, 0, 0, 0, 0]),
    ]));
};
exports.createVmhd = createVmhd;
