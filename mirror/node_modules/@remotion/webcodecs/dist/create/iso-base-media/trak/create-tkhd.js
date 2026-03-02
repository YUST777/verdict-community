"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTkhdForVideo = exports.createTkhdForAudio = exports.TKHD_FLAGS = void 0;
const from_unix_timestamp_1 = require("../../../from-unix-timestamp");
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
exports.TKHD_FLAGS = {
    TRACK_ENABLED: 0x000001,
    TRACK_IN_MOVIE: 0x000002,
    TRACK_IN_PREVIEW: 0x000004,
    TRACK_IN_POSTER: 0x000008,
};
const createTkhdForAudio = ({ creationTime, modificationTime, flags, trackId, duration, volume, timescale, }) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // name
        (0, primitives_1.stringsToUint8Array)('tkhd'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, flags]),
        // creation time
        creationTime === null
            ? (0, primitives_1.numberTo32BitUIntOrInt)(0)
            : (0, primitives_1.numberTo32BitUIntOrInt)((0, from_unix_timestamp_1.fromUnixTimestamp)(creationTime)),
        // modification time
        modificationTime === null
            ? (0, primitives_1.numberTo32BitUIntOrInt)(0)
            : (0, primitives_1.numberTo32BitUIntOrInt)((0, from_unix_timestamp_1.fromUnixTimestamp)(modificationTime)),
        // trackId
        (0, primitives_1.numberTo32BitUIntOrInt)(trackId),
        // reserved
        new Uint8Array([0, 0, 0, 0]),
        // duration
        (0, primitives_1.numberTo32BitUIntOrInt)(Math.round((duration / 1000) * timescale)),
        // reserved
        new Uint8Array([0, 0, 0, 0]),
        new Uint8Array([0, 0, 0, 0]),
        // layer
        new Uint8Array([0, 0]),
        // alternate group, 1 = 'sound'
        new Uint8Array([0, 1]),
        // volume
        (0, primitives_1.floatTo16Point16_16Bit)(volume),
        // reserved
        new Uint8Array([0, 0]),
        // matrix
        (0, primitives_1.serializeMatrix)(primitives_1.IDENTITY_MATRIX),
        // width
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(0),
        // height
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(0),
    ]));
};
exports.createTkhdForAudio = createTkhdForAudio;
const createTkhdForVideo = ({ creationTime, modificationTime, duration, trackId, volume, matrix, width, height, flags, timescale, }) => {
    const content = (0, matroska_utils_1.combineUint8Arrays)([
        // name
        (0, primitives_1.stringsToUint8Array)('tkhd'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, flags]),
        // creation time
        creationTime === null
            ? (0, primitives_1.numberTo32BitUIntOrInt)(0)
            : (0, primitives_1.numberTo32BitUIntOrInt)((0, from_unix_timestamp_1.fromUnixTimestamp)(creationTime)),
        // modification time
        modificationTime === null
            ? (0, primitives_1.numberTo32BitUIntOrInt)(0)
            : (0, primitives_1.numberTo32BitUIntOrInt)((0, from_unix_timestamp_1.fromUnixTimestamp)(modificationTime)),
        // trackId
        (0, primitives_1.numberTo32BitUIntOrInt)(trackId),
        // reserved
        new Uint8Array([0, 0, 0, 0]),
        // duration
        (0, primitives_1.numberTo32BitUIntOrInt)((duration / 1000) * timescale),
        // reserved
        new Uint8Array([0, 0, 0, 0]),
        new Uint8Array([0, 0, 0, 0]),
        // layer
        new Uint8Array([0, 0]),
        // alternate group, 0 = 'video'
        new Uint8Array([0, 0]),
        // volume
        (0, primitives_1.floatTo16Point16_16Bit)(volume),
        // reserved
        new Uint8Array([0, 0]),
        // matrix
        (0, primitives_1.serializeMatrix)(matrix),
        // width
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(width),
        // height
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(height),
    ]);
    return (0, primitives_1.addSize)(content);
};
exports.createTkhdForVideo = createTkhdForVideo;
