"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasp = void 0;
const matroska_utils_1 = require("../../../../../../matroska/matroska-utils");
const primitives_1 = require("../../../../../primitives");
const createPasp = (x, y) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        (0, primitives_1.stringsToUint8Array)('pasp'),
        (0, primitives_1.numberTo32BitUIntOrInt)(x),
        (0, primitives_1.numberTo32BitUIntOrInt)(y),
    ]));
};
exports.createPasp = createPasp;
