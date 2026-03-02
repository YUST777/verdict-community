"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRiffHeader = void 0;
const parseRiffHeader = (state) => {
    const riff = state.iterator.getByteString(4, false);
    if (riff !== 'RIFF') {
        throw new Error('Not a RIFF file');
    }
    const structure = state.structure.getRiffStructure();
    const size = state.iterator.getUint32Le();
    const fileType = state.iterator.getByteString(4, false);
    if (fileType !== 'WAVE' && fileType !== 'AVI') {
        throw new Error(`File type ${fileType} not supported`);
    }
    structure.boxes.push({ type: 'riff-header', fileSize: size, fileType });
    return null;
};
exports.parseRiffHeader = parseRiffHeader;
