"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseId3 = void 0;
// non-standard, we discard it in favor of LIST boxes
const parseId3 = ({ state, }) => {
    const { iterator } = state;
    const id3Size = iterator.getUint32Le();
    iterator.discard(id3Size);
    const id3Box = {
        type: 'wav-id3',
    };
    state.structure.getWavStructure().boxes.push(id3Box);
    return Promise.resolve(null);
};
exports.parseId3 = parseId3;
