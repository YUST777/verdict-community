"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioEncoderConfig = void 0;
const getCodecString = (audioCodec) => {
    if (audioCodec === 'opus') {
        return 'opus';
    }
    if (audioCodec === 'aac') {
        return 'mp4a.40.02';
    }
    if (audioCodec === 'wav') {
        return 'wav-should-not-to-into-audio-encoder';
    }
    throw new Error(`Unsupported audio codec: ${audioCodec}`);
};
const getAudioEncoderConfig = async (config) => {
    const actualConfig = {
        ...config,
        codec: getCodecString(config.codec),
    };
    if (config.codec === 'wav') {
        return actualConfig;
    }
    if (typeof AudioEncoder === 'undefined') {
        return null;
    }
    if ((await AudioEncoder.isConfigSupported(actualConfig)).supported) {
        return actualConfig;
    }
    const maybeItIsTheSampleRateThatIsTheProblem = config.sampleRate !== 48000 && config.sampleRate !== 44100;
    if (maybeItIsTheSampleRateThatIsTheProblem) {
        return (0, exports.getAudioEncoderConfig)({
            ...config,
            sampleRate: config.sampleRate === 22050 ? 44100 : 48000,
        });
    }
    return null;
};
exports.getAudioEncoderConfig = getAudioEncoderConfig;
