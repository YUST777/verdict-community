"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMinf = void 0;
const matroska_utils_1 = require("../../../matroska/matroska-utils");
const primitives_1 = require("../../primitives");
const create_dinf_1 = require("./minf/create-dinf");
const createMinf = ({ vmhdAtom, stblAtom, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('minf'),
        // vmhd
        vmhdAtom,
        // dinf
        (0, create_dinf_1.createDinf)(),
        // stbl
        stblAtom,
    ]));
};
exports.createMinf = createMinf;
