"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToo = void 0;
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createToo = (value) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type: ©too
        new Uint8Array([0xa9, 0x74, 0x6f, 0x6f]),
        // data
        (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
            // data
            new Uint8Array([0x64, 0x61, 0x74, 0x61]),
            // type indicator
            new Uint8Array([0, 0]),
            // well-known type
            new Uint8Array([0, 1]),
            // country indicator
            new Uint8Array([0, 0]),
            // language indicator
            new Uint8Array([0, 0]),
            // value
            (0, primitives_1.stringsToUint8Array)(value),
        ])),
    ]));
};
exports.createToo = createToo;
