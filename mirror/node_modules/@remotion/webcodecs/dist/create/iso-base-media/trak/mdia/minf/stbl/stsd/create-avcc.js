"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAvccBox = void 0;
const matroska_utils_1 = require("../../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../../primitives");
const createAvccBox = (privateData) => {
    if (!privateData) {
        throw new Error('privateData is required');
    }
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('avcC'),
        privateData,
    ]));
};
exports.createAvccBox = createAvccBox;
