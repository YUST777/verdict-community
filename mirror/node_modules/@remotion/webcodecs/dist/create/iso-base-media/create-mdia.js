"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMdia = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createMdia = ({ mdhd, hdlr, minf, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('mdia'),
        // mdhd
        mdhd,
        // hdlr
        hdlr,
        // minf
        minf,
    ]));
};
exports.createMdia = createMdia;
