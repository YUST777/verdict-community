"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFromFlac = void 0;
const getMetadataFromFlac = (structure) => {
    const box = structure.boxes.find((b) => b.type === 'flac-vorbis-comment');
    if (!box) {
        return null;
    }
    return box.fields;
};
exports.getMetadataFromFlac = getMetadataFromFlac;
