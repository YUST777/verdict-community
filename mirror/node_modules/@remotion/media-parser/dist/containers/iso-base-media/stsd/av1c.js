"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAv1C = void 0;
const parseAv1C = ({ data, size, }) => {
    return {
        type: 'av1C-box',
        privateData: data.getSlice(size - 8),
    };
};
exports.parseAv1C = parseAv1C;
