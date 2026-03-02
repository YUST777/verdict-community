"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldGroupAudioSamples = void 0;
const get_audio_codec_1 = require("../../get-audio-codec");
const shouldGroupAudioSamples = (trakBox) => {
    const isLpcm = (0, get_audio_codec_1.isLpcmAudioCodec)(trakBox);
    const isIn24 = (0, get_audio_codec_1.isIn24AudioCodec)(trakBox);
    const isTwos = (0, get_audio_codec_1.isTwosAudioCodec)(trakBox);
    if (isLpcm || isIn24 || isTwos) {
        return {
            bigEndian: isTwos || isIn24,
        };
    }
    return null;
};
exports.shouldGroupAudioSamples = shouldGroupAudioSamples;
