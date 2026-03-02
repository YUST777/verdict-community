"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodecStringForEncoder = void 0;
const choose_correct_avc1_profile_1 = require("./choose-correct-avc1-profile");
const choose_correct_hevc_profile_1 = require("./choose-correct-hevc-profile");
const getCodecStringForEncoder = ({ codec, fps, height, width, }) => {
    if (codec === 'h264') {
        return (0, choose_correct_avc1_profile_1.chooseCorrectAvc1Profile)({ fps, height, width }); // return chooseCorrectAvc1Profile({fps, height, width});
    }
    if (codec === 'h265') {
        return (0, choose_correct_hevc_profile_1.chooseCorrectHevcProfile)({ fps, height, width });
    }
    if (codec === 'vp8') {
        return 'vp8';
    }
    if (codec === 'vp9') {
        return 'vp09.00.10.08';
    }
    throw new Error(`Unknown codec: ${codec}`);
};
exports.getCodecStringForEncoder = getCodecStringForEncoder;
