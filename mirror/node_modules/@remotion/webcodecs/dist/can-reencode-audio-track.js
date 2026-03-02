"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canReencodeAudioTrack = void 0;
const audio_decoder_config_1 = require("./audio-decoder-config");
const audio_encoder_config_1 = require("./audio-encoder-config");
const canReencodeAudioTrack = async ({ track, audioCodec, bitrate, sampleRate, }) => {
    const audioDecoderConfig = await (0, audio_decoder_config_1.getAudioDecoderConfig)(track);
    if (audioCodec === 'wav' && audioDecoderConfig) {
        return true;
    }
    const audioEncoderConfig = await (0, audio_encoder_config_1.getAudioEncoderConfig)({
        codec: audioCodec,
        numberOfChannels: track.numberOfChannels,
        sampleRate: sampleRate ?? track.sampleRate,
        bitrate,
    });
    return Boolean(audioDecoderConfig && audioEncoderConfig);
};
exports.canReencodeAudioTrack = canReencodeAudioTrack;
