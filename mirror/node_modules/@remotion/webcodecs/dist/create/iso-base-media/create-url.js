"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUrlAtom = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createUrlAtom = () => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('url '),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 1]),
    ]));
};
exports.createUrlAtom = createUrlAtom;
