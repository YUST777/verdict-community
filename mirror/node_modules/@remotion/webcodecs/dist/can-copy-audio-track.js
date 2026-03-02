"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canCopyAudioTrack = void 0;
const is_different_video_codec_1 = require("./is-different-video-codec");
const canCopyAudioTrack = ({ inputCodec, outputContainer, inputContainer, outputAudioCodec, }) => {
    if (outputAudioCodec) {
        if (!(0, is_different_video_codec_1.isSameAudioCodec)({
            inputAudioCodec: inputCodec,
            outputCodec: outputAudioCodec,
        })) {
            return false;
        }
    }
    if (outputContainer === 'webm') {
        return inputCodec === 'opus';
    }
    if (outputContainer === 'mp4') {
        return (inputCodec === 'aac' &&
            (inputContainer === 'mp4' ||
                inputContainer === 'avi' ||
                inputContainer === 'm3u8'));
    }
    if (outputContainer === 'wav') {
        return false;
    }
    throw new Error(`Unhandled container: ${outputContainer}`);
};
exports.canCopyAudioTrack = canCopyAudioTrack;
