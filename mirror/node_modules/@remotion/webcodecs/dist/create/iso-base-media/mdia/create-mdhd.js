"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMdhd = void 0;
const from_unix_timestamp_1 = require("../../../from-unix-timestamp");
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createMdhd = ({ creationTime, modificationTime, timescale, duration, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('mdhd'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // creation time
        creationTime === null
            ? (0, primitives_1.numberTo32BitUIntOrInt)(0)
            : (0, primitives_1.numberTo32BitUIntOrInt)((0, from_unix_timestamp_1.fromUnixTimestamp)(creationTime)),
        // modification time
        modificationTime === null
            ? (0, primitives_1.numberTo32BitUIntOrInt)(0)
            : (0, primitives_1.numberTo32BitUIntOrInt)((0, from_unix_timestamp_1.fromUnixTimestamp)(modificationTime)),
        // timescale
        (0, primitives_1.numberTo32BitUIntOrInt)(timescale),
        // duration
        (0, primitives_1.numberTo32BitUIntOrInt)(Math.round((duration / 1000) * timescale)),
        // language: unspecified
        new Uint8Array([0x55, 0xc4]),
        // quality
        new Uint8Array([0, 0]),
    ]));
};
exports.createMdhd = createMdhd;
