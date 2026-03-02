"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultVideoCodec = void 0;
const getDefaultVideoCodec = ({ container, }) => {
    if (container === 'webm') {
        return 'vp8';
    }
    if (container === 'mp4') {
        return 'h264';
    }
    if (container === 'wav') {
        return null;
    }
    throw new Error(`Unhandled container: ${container}`);
};
exports.getDefaultVideoCodec = getDefaultVideoCodec;
