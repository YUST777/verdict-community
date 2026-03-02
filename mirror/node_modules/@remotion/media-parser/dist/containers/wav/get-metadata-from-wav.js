"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFromWav = void 0;
const getMetadataFromWav = (structure) => {
    const list = structure.boxes.find((b) => b.type === 'wav-list');
    if (!list) {
        return null;
    }
    return list.metadata;
};
exports.getMetadataFromWav = getMetadataFromWav;
