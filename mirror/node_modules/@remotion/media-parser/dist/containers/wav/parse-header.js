"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHeader = void 0;
const parseHeader = ({ state, }) => {
    const fileSize = state.iterator.getUint32Le();
    const fileType = state.iterator.getByteString(4, false);
    if (fileType !== 'WAVE') {
        throw new Error(`Expected WAVE, got ${fileType}`);
    }
    const header = {
        type: 'wav-header',
        fileSize,
    };
    state.structure.getWavStructure().boxes.push(header);
    return Promise.resolve(null);
};
exports.parseHeader = parseHeader;
