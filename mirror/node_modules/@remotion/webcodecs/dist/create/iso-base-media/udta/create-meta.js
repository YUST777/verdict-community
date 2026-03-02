"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeta = void 0;
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createMeta = ({ hdlr, ilst, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('meta'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // hdlr
        hdlr,
        // ilst
        ilst,
    ]));
};
exports.createMeta = createMeta;
