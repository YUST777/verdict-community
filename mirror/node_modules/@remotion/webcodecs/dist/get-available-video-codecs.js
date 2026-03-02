"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableVideoCodecs = exports.availableVideoCodecs = void 0;
exports.availableVideoCodecs = ['vp8', 'vp9', 'h264', 'h265'];
const getAvailableVideoCodecs = ({ container, }) => {
    if (container === 'mp4') {
        return ['h264', 'h265'];
    }
    if (container === 'webm') {
        return ['vp8', 'vp9'];
    }
    if (container === 'wav') {
        return [];
    }
    throw new Error(`Unsupported container: ${container}`);
};
exports.getAvailableVideoCodecs = getAvailableVideoCodecs;
