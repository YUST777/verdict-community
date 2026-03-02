"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpsPpsData = void 0;
const combine_uint8_arrays_1 = require("../../combine-uint8-arrays");
const truthy_1 = require("../../truthy");
function serializeUint16(value) {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, value);
    return new Uint8Array(buffer);
}
const createSpsPpsData = (avc1Profile) => {
    return (0, combine_uint8_arrays_1.combineUint8Arrays)([
        new Uint8Array([
            // https://gist.github.com/uupaa/8493378ec15f644a3d2b
            1, // version
            avc1Profile.sps.spsData.profile,
            avc1Profile.sps.spsData.compatibility,
            avc1Profile.sps.spsData.level,
            0xff,
            0xe1,
        ]),
        // sequence parameter set length
        serializeUint16(avc1Profile.sps.sps.length),
        // sequence parameter set
        avc1Profile.sps.sps,
        // num of PPS
        new Uint8Array([0x01]),
        // picture parameter set length
        serializeUint16(avc1Profile.pps.pps.length),
        // PPS
        avc1Profile.pps.pps,
        // if AVCProfileIndication != 66 && AVCProfileIndication != 77 && AVCProfileIndication != 88
        [66, 77, 88].some((b) => avc1Profile.sps.spsData.profile === b)
            ? null
            : /**
             *  reserved	63 (0x3F)
                    chroma_format	1, '4:2:0'
                    reserved	31 (0x1F)
                    bit_depth_luma_minus8	0
                    reserved	31 (0x1F)
                    bit_depth_chroma_minus8	0
                    numOfSequenceParameterSetExt	0
             */
                new Uint8Array([0xfd, 0xf8, 0xf8, 0]),
    ].filter(truthy_1.truthy));
};
exports.createSpsPpsData = createSpsPpsData;
