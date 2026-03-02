"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMp4a = void 0;
const matroska_utils_1 = require("../../matroska/matroska-utils");
const primitives_1 = require("../primitives");
const createMp4a = ({ sampleRate, channelCount, avgBitrate, maxBitrate, codecPrivate, }) => {
    if (!codecPrivate) {
        throw new Error('Need codecPrivate for mp4a');
    }
    const esdsAtom = (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('esds'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // tag = 'ES_DescrTag'
        new Uint8Array([3]),
        (0, primitives_1.addLeading128Size)((0, matroska_utils_1.combineUint8Arrays)([
            // ES_ID
            (0, primitives_1.numberTo16BitUIntOrInt)(2),
            // streamDependenceFlag, URL_Flag, OCRstreamFlag
            new Uint8Array([0]),
            // DecoderConfigDescrTag
            new Uint8Array([4]),
            (0, primitives_1.addLeading128Size)((0, matroska_utils_1.combineUint8Arrays)([
                // objectTypeIndication
                new Uint8Array([0x40]),
                // streamType, upStream
                new Uint8Array([21]),
                // reserved
                new Uint8Array([0, 0, 0]),
                // maxBitrate
                (0, primitives_1.numberTo32BitUIntOrInt)(maxBitrate),
                // avgBitrate
                (0, primitives_1.numberTo32BitUIntOrInt)(avgBitrate),
                // DecoderSpecificInfoTag
                new Uint8Array([5]),
                // see create-aac-codecprivate.ts
                (0, primitives_1.addLeading128Size)(codecPrivate),
            ])),
            // SLConfigDescrTag
            new Uint8Array([6]),
            (0, primitives_1.addLeading128Size)(new Uint8Array([2])),
        ])),
    ]));
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('mp4a'),
        // reserved
        new Uint8Array([0, 0, 0, 0, 0, 0]),
        // data_reference_index
        (0, primitives_1.numberTo16BitUIntOrInt)(1),
        // version
        (0, primitives_1.numberTo16BitUIntOrInt)(0),
        // revision level
        (0, primitives_1.numberTo16BitUIntOrInt)(0),
        // vendor
        new Uint8Array([0, 0, 0, 0]),
        // channelCount
        (0, primitives_1.numberTo16BitUIntOrInt)(channelCount),
        // sampleSize
        (0, primitives_1.numberTo16BitUIntOrInt)(16),
        // compressionId
        (0, primitives_1.numberTo16BitUIntOrInt)(0),
        // packet size
        (0, primitives_1.numberTo16BitUIntOrInt)(0),
        // sample rate
        (0, primitives_1.setFixedPointSignedOrUnsigned1616Number)(sampleRate),
        // esds atom
        esdsAtom,
    ]));
};
exports.createMp4a = createMp4a;
