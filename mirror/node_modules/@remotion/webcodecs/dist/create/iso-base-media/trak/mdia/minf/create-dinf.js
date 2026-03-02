"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDinf = void 0;
const matroska_utils_1 = require("../../../../matroska/matroska-utils");
const primitives_1 = require("../../../primitives");
const createDinf = () => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        (0, primitives_1.stringsToUint8Array)('dinf'),
        (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
            (0, primitives_1.stringsToUint8Array)('dref'),
            new Uint8Array([0]), // version
            new Uint8Array([0, 0, 0]), // flags
            new Uint8Array([0, 0, 0, 1]), // entry count
            (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
                (0, primitives_1.stringsToUint8Array)('url '),
                new Uint8Array([0]), // version
                new Uint8Array([0, 0, 1]), // flags
            ])),
        ])),
    ]));
};
exports.createDinf = createDinf;
