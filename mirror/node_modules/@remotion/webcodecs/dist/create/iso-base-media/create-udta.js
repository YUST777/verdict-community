"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUdta = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createUdta = (children) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('udta'),
        // children
        children,
    ]));
};
exports.createUdta = createUdta;
