"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioDecoderConfig = void 0;
const getAudioDecoderConfig = async (config) => {
    if (config.codec === 'pcm-s16') {
        return config;
    }
    if (config.codec === 'pcm-s24') {
        return config;
    }
    if (typeof AudioDecoder === 'undefined') {
        return null;
    }
    if (typeof EncodedAudioChunk === 'undefined') {
        return null;
    }
    if ((await AudioDecoder.isConfigSupported(config)).supported) {
        return config;
    }
    return null;
};
exports.getAudioDecoderConfig = getAudioDecoderConfig;
