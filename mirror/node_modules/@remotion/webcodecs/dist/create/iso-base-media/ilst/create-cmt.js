"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCmt = void 0;
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createCmt = (comment) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // ©cmt
        new Uint8Array([0xa9, 0x63, 0x6d, 0x74]),
        (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
            // data
            (0, primitives_1.stringsToUint8Array)('data'),
            // type indicator
            new Uint8Array([0, 0]),
            // well-known type
            new Uint8Array([0, 1]),
            // country indicator
            new Uint8Array([0, 0]),
            // language indicator
            new Uint8Array([0, 0]),
            // value
            (0, primitives_1.stringsToUint8Array)(comment),
        ])),
    ]));
};
exports.createCmt = createCmt;
