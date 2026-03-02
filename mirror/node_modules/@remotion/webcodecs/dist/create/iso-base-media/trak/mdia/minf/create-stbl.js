"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStbl = void 0;
const truthy_1 = require("../../../../../truthy");
const matroska_utils_1 = require("../../../../matroska/matroska-utils");
const primitives_1 = require("../../../primitives");
const create_ctts_1 = require("./stbl/create-ctts");
const create_stco_1 = require("./stbl/create-stco");
const create_stsc_1 = require("./stbl/create-stsc");
const create_stss_1 = require("./stbl/create-stss");
const create_stsz_1 = require("./stbl/create-stsz");
const create_stts_1 = require("./stbl/create-stts");
const create_avc1_1 = require("./stbl/stsd/create-avc1");
const createStbl = ({ samplePositions, codecSpecificData, isVideo, }) => {
    // For stts:
    // https://developer.apple.com/documentation/quicktime-file-format/time-to-sample_atom
    // The sample entries are ordered by time stamps; therefore, the deltas are all nonnegative.
    // For the other tables, there doesn't seem to be a requirement for them to be sorted
    // -> ordering the sample positions by dts
    const sorted = samplePositions
        .slice()
        .sort((a, b) => a.decodingTimestamp - b.decodingTimestamp);
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        (0, primitives_1.stringsToUint8Array)('stbl'),
        (0, create_avc1_1.createStsdData)(codecSpecificData),
        (0, create_stts_1.createSttsAtom)(sorted),
        isVideo ? (0, create_stss_1.createStss)(samplePositions) : null,
        (0, create_ctts_1.createCttsBox)(samplePositions),
        (0, create_stsc_1.createStsc)(samplePositions),
        (0, create_stsz_1.createStsz)(samplePositions),
        (0, create_stco_1.createStcoAtom)(samplePositions),
        isVideo
            ? null
            : new Uint8Array([
                0x00, 0x00, 0x00, 0x1a, 0x73, 0x67, 0x70, 0x64, 0x01, 0x00, 0x00,
                0x00, 0x72, 0x6f, 0x6c, 0x6c, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00,
                0x00, 0x01, 0xff, 0xff, 0x00, 0x00, 0x00, 0x1c, 0x73, 0x62, 0x67,
                0x70, 0x00, 0x00, 0x00, 0x00, 0x72, 0x6f, 0x6c, 0x6c, 0x00, 0x00,
                0x00, 0x01, 0x00, 0x00, 0x0a, 0x19, 0x00, 0x00, 0x00, 0x01,
            ]),
    ].filter(truthy_1.truthy)));
};
exports.createStbl = createStbl;
