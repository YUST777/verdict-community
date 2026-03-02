"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationFromWav = void 0;
const getDurationFromWav = (state) => {
    const structure = state.structure.getWavStructure();
    const fmt = structure.boxes.find((b) => b.type === 'wav-fmt');
    if (!fmt) {
        throw new Error('Expected fmt box');
    }
    const dataBox = structure.boxes.find((b) => b.type === 'wav-data');
    if (!dataBox) {
        throw new Error('Expected data box');
    }
    const durationInSeconds = dataBox.dataSize / (fmt.sampleRate * fmt.blockAlign);
    return durationInSeconds;
};
exports.getDurationFromWav = getDurationFromWav;
