"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFlacHeader = void 0;
const parseFlacHeader = ({ state, }) => {
    state.structure.getFlacStructure().boxes.push({
        type: 'flac-header',
    });
    return Promise.resolve(null);
};
exports.parseFlacHeader = parseFlacHeader;
