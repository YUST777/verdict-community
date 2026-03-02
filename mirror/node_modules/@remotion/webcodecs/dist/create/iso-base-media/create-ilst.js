"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIlst = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createIlst = (items) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // name
        (0, primitives_1.stringsToUint8Array)('ilst'),
        // items
        ...items,
    ]));
};
exports.createIlst = createIlst;
