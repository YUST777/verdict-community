"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMoov = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createMoov = ({ mvhd, traks, udta, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('moov'),
        // moov atom
        mvhd,
        // traks
        ...traks,
        // udta
        udta,
    ]));
};
exports.createMoov = createMoov;
