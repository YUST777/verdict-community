"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFlacUnkownBlock = void 0;
const parseFlacUnkownBlock = ({ iterator, state, size, }) => {
    iterator.discard(size);
    state.structure.getFlacStructure().boxes.push({
        type: 'flac-header',
    });
    return Promise.resolve(null);
};
exports.parseFlacUnkownBlock = parseFlacUnkownBlock;
