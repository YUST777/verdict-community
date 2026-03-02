"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMvhd = void 0;
const from_unix_timestamp_1 = require("../../from-unix-timestamp");
const matroska_utils_1 = require("../matroska/matroska-utils");
const primitives_1 = require("./primitives");
const createMvhd = ({ timescale, durationInUnits, rate, volume, nextTrackId, matrix, creationTime, modificationTime, }) => {
    if (matrix.length !== 9) {
        throw new Error('Matrix must be 9 elements long');
    }
    const content = (0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('mvhd'),
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
        // duration in units, 32bit for version 0
        (0, primitives_1.numberTo32BitUIntOrInt)(durationInUnits),
        // rate
        (0, primitives_1.floatTo16Point1632Bit)(rate),
        // volume
        (0, primitives_1.floatTo16Point16_16Bit)(volume),
        // reserved
        new Uint8Array([0, 0]),
        // reserved
        new Uint8Array([0, 0, 0, 0]),
        // reserved
        new Uint8Array([0, 0, 0, 0]),
        (0, primitives_1.serializeMatrix)(matrix),
        // predefined
        (0, matroska_utils_1.combineUint8Arrays)(new Array(6).fill(new Uint8Array([0, 0, 0, 0]))),
        // next track id
        (0, primitives_1.numberTo32BitUIntOrInt)(nextTrackId),
    ]);
    return (0, primitives_1.addSize)(content);
};
exports.createMvhd = createMvhd;
