"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSmhd = void 0;
const matroska_utils_1 = require("../../../../matroska/matroska-utils");
const primitives_1 = require("../../../primitives");
const createSmhd = () => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('smhd'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // balance
        new Uint8Array([0, 0]),
        // reserved
        new Uint8Array([0, 0]),
    ]));
};
exports.createSmhd = createSmhd;
