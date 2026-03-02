"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByteFromWav = exports.WAVE_SAMPLES_PER_SECOND = void 0;
exports.WAVE_SAMPLES_PER_SECOND = 25;
const getSeekingByteFromWav = ({ info, time, }) => {
    const bytesPerSecond = info.sampleRate * info.blockAlign;
    const durationInSeconds = info.mediaSection.size / bytesPerSecond;
    const timeRoundedDown = Math.floor(Math.min(time, durationInSeconds - 0.0000001) * exports.WAVE_SAMPLES_PER_SECOND) / exports.WAVE_SAMPLES_PER_SECOND;
    const byteOffset = bytesPerSecond * timeRoundedDown;
    return Promise.resolve({
        type: 'do-seek',
        byte: byteOffset + info.mediaSection.start,
        timeInSeconds: timeRoundedDown,
    });
};
exports.getSeekingByteFromWav = getSeekingByteFromWav;
