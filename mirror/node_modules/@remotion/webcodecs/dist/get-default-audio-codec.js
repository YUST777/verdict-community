"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultAudioCodec = void 0;
const getDefaultAudioCodec = ({ container, }) => {
    if (container === 'webm') {
        return 'opus';
    }
    if (container === 'mp4') {
        return 'aac';
    }
    if (container === 'wav') {
        return 'wav';
    }
    throw new Error(`Unhandled container: ${container}`);
};
exports.getDefaultAudioCodec = getDefaultAudioCodec;
