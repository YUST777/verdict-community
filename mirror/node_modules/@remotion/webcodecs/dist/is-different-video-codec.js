"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameAudioCodec = exports.isSameVideoCodec = void 0;
const isSameVideoCodec = ({ inputVideoCodec, outputCodec, }) => {
    if (outputCodec === 'h264') {
        return inputVideoCodec === 'h264';
    }
    if (outputCodec === 'h265') {
        return inputVideoCodec === 'h265';
    }
    if (outputCodec === 'vp8') {
        return inputVideoCodec === 'vp8';
    }
    if (outputCodec === 'vp9') {
        return inputVideoCodec === 'vp9';
    }
    throw new Error(`Unsupported output codec: ${outputCodec}`);
};
exports.isSameVideoCodec = isSameVideoCodec;
const isSameAudioCodec = ({ inputAudioCodec, outputCodec, }) => {
    if (outputCodec === 'aac') {
        return inputAudioCodec === 'aac';
    }
    if (outputCodec === 'opus') {
        return inputAudioCodec === 'opus';
    }
    if (outputCodec === 'wav') {
        return (inputAudioCodec === 'pcm-f32' ||
            inputAudioCodec === 'pcm-s16' ||
            inputAudioCodec === 'pcm-s24' ||
            inputAudioCodec === 'pcm-s32' ||
            inputAudioCodec === 'pcm-u8');
    }
    throw new Error(`Unsupported output codec: ${outputCodec}`);
};
exports.isSameAudioCodec = isSameAudioCodec;
