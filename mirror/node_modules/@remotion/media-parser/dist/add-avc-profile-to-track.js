"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAvcProfileToTrack = void 0;
const codec_string_1 = require("./containers/avc/codec-string");
const create_sps_pps_data_1 = require("./containers/avc/create-sps-pps-data");
const addAvcProfileToTrack = (track, avc1Profile) => {
    if (avc1Profile === null) {
        return track;
    }
    return {
        ...track,
        codec: (0, codec_string_1.getCodecStringFromSpsAndPps)(avc1Profile.sps),
        codecData: { type: 'avc-sps-pps', data: (0, create_sps_pps_data_1.createSpsPpsData)(avc1Profile) },
        // description should be undefined, since this signals to WebCodecs that
        // the codec is in Annex B format, which is the case for AVI files
        // https://www.w3.org/TR/webcodecs-avc-codec-registration/#videodecoderconfig-description
        // ChatGPT 4.1: "Great question! The format of the H.264/AVC bitstream inside a ⁠.avi file is almost always in the "Annex B" format"
        // (description is probably already undefined at this point, just writing this to be explicit)
        description: undefined,
    };
};
exports.addAvcProfileToTrack = addAvcProfileToTrack;
