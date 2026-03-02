"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableAudioCodecs = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const availableAudioCodecs = ['opus', 'aac', 'wav'];
const getAvailableAudioCodecs = ({ container, }) => {
    if (container === 'mp4') {
        return ['aac'];
    }
    if (container === 'webm') {
        return ['opus'];
    }
    if (container === 'wav') {
        return ['wav'];
    }
    throw new Error(`Unsupported container: ${container}`);
};
exports.getAvailableAudioCodecs = getAvailableAudioCodecs;
