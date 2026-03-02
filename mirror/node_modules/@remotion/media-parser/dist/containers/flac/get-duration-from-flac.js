"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationFromFlac = void 0;
const getDurationFromFlac = (parserState) => {
    const structure = parserState.structure.getFlacStructure();
    const streaminfo = structure.boxes.find((b) => b.type === 'flac-streaminfo');
    if (!streaminfo) {
        throw new Error('Streaminfo not found');
    }
    return streaminfo.totalSamples / streaminfo.sampleRate;
};
exports.getDurationFromFlac = getDurationFromFlac;
