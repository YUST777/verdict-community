"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleRate = void 0;
// https://www.rfc-editor.org/rfc/rfc9639.html#name-sample-rate-bits
const getSampleRate = (iterator, state) => {
    var _a, _b;
    const mode = iterator.getBits(4);
    if (mode === 0b0000 || mode === 0b1111) {
        const structure = state.structure.getFlacStructure();
        const sampleRate = (_b = (_a = structure.boxes.find((box) => box.type === 'flac-streaminfo')) === null || _a === void 0 ? void 0 : _a.sampleRate) !== null && _b !== void 0 ? _b : null;
        if (sampleRate === null) {
            throw new Error('Sample rate not found');
        }
        return sampleRate;
    }
    if (mode === 0b0001) {
        return 88200;
    }
    if (mode === 0b0010) {
        return 176400;
    }
    if (mode === 0b0011) {
        return 192000;
    }
    if (mode === 0b0100) {
        return 8000;
    }
    if (mode === 0b0101) {
        return 16000;
    }
    if (mode === 0b0110) {
        return 22050;
    }
    if (mode === 0b0111) {
        return 24000;
    }
    if (mode === 0b1000) {
        return 32000;
    }
    if (mode === 0b1001) {
        return 44100;
    }
    if (mode === 0b1010) {
        return 48000;
    }
    if (mode === 0b1011) {
        return 96000;
    }
    if (mode === 0b1100) {
        return 'uncommon-u8';
    }
    if (mode === 0b1101) {
        return 'uncommon-u16';
    }
    if (mode === 0b1110) {
        return 'uncommon-u16-10';
    }
    throw new Error(`Invalid sample rate mode: ${mode.toString(2)}`);
};
exports.getSampleRate = getSampleRate;
