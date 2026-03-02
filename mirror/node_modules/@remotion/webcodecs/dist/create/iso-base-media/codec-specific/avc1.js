"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAvc1Data = void 0;
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createAvc1Data = ({ avccBox, pasp, width, height, horizontalResolution, verticalResolution, compressorName, depth, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('avc1'),
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
        // avcc box
        avccBox,
        // pasp
        pasp,
    ]));
};
exports.createAvc1Data = createAvc1Data;
