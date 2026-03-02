"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHvccBox = void 0;
const matroska_utils_1 = require("../../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../../primitives");
const createHvccBox = (privateData) => {
    if (!privateData) {
        throw new Error('privateData is required');
    }
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('hvcC'),
        privateData,
    ]));
};
exports.createHvccBox = createHvccBox;
