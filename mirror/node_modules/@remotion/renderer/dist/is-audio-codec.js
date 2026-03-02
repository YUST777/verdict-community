"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAudioCodec = void 0;
const isAudioCodec = (codec) => {
    return codec === 'mp3' || codec === 'aac' || codec === 'wav';
};
exports.isAudioCodec = isAudioCodec;
