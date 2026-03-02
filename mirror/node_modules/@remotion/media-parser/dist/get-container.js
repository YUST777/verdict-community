"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasContainer = exports.getContainer = void 0;
const traversal_1 = require("./containers/riff/traversal");
const getContainer = (segments) => {
    if (segments.type === 'iso-base-media') {
        return 'mp4';
    }
    if (segments.type === 'matroska') {
        return 'webm';
    }
    if (segments.type === 'transport-stream') {
        return 'transport-stream';
    }
    if (segments.type === 'mp3') {
        return 'mp3';
    }
    if (segments.type === 'wav') {
        return 'wav';
    }
    if (segments.type === 'flac') {
        return 'flac';
    }
    if (segments.type === 'riff') {
        if ((0, traversal_1.isRiffAvi)(segments)) {
            return 'avi';
        }
        throw new Error('Unknown RIFF container ' + segments.type);
    }
    if (segments.type === 'aac') {
        return 'aac';
    }
    if (segments.type === 'm3u') {
        return 'm3u8';
    }
    throw new Error('Unknown container ' + segments);
};
exports.getContainer = getContainer;
const hasContainer = (boxes) => {
    try {
        return (0, exports.getContainer)(boxes) !== null;
    }
    catch (_a) {
        return false;
    }
};
exports.hasContainer = hasContainer;
