"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHvc1Data = void 0;
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createHvc1Data = ({ compressorName, depth, height, horizontalResolution, hvccBox, pasp, verticalResolution, width, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('hvc1'),
        // reserved
        new Uint8Array([0, 0, 0, 0, 0, 0]),
        // data_reference_index
        new Uint8Array([0, 1]),
        // version
        new Uint8Array([0, 0]),
        // revisionLevel
        new Uint8Array([0, 0]),
        // vendor
        new Uint8Array([0, 0, 0, 0]),
        // temporalQuality
        new Uint8Array([0, 0, 0, 0]),
        // spatialQuality
        new Uint8Array([0, 0, 0, 0]),
        // width
        (0, primitives_1.numberTo16BitUIntOrInt)(width),
        // height
        (0, primitives_1.numberTo16BitUIntOrInt)(height),
        // horizontalResolution
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(horizontalResolution),
        // verticalResolution
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(verticalResolution),
        // dataSize
        new Uint8Array([0, 0, 0, 0]),
        // frame count per sample
        (0, primitives_1.numberTo16BitUIntOrInt)(1),
        // compressor name
        (0, primitives_1.stringToPascalString)(compressorName),
        // depth
        (0, primitives_1.numberTo16BitUIntOrInt)(depth),
        // colorTableId
        (0, primitives_1.numberTo16BitUIntOrInt)(-1),
        // hvcc box
        hvccBox,
        // pasp
        pasp,
    ]));
};
exports.createHvc1Data = createHvc1Data;
