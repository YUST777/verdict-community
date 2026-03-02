"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createColr = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
// TODO: Not used in creation of MP4 yet
const createColr = ({ fullRange, matrixIndex, primaries, transferFunction, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('colr'),
        // colour_type
        (0, primitives_1.stringsToUint8Array)('nclx'),
        // primaries
        // 1 = 'ITU-R BT.7090
        new Uint8Array([0, primaries]),
        // transfer_function
        // 1 = 'ITU-R BT.7090
        new Uint8Array([0, transferFunction]),
        // matrix_index
        // 1 = 'ITU-R BT.7090
        new Uint8Array([0, matrixIndex]),
        // full_range_flag
        new Uint8Array([fullRange ? 1 : 0]),
    ]));
};
exports.createColr = createColr;
