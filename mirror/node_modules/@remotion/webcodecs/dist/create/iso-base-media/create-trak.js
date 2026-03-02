"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrak = void 0;
const truthy_1 = require("../../truthy");
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createTrak = ({ tkhd, mdia, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // name
        (0, primitives_1.stringsToUint8Array)('trak'),
        // tkhd
        tkhd,
        // mdia
        mdia,
    ].filter(truthy_1.truthy)));
};
exports.createTrak = createTrak;
