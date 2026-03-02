"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFromMp3 = void 0;
const getMetadataFromMp3 = (mp3Structure) => {
    const findHeader = mp3Structure.boxes.find((b) => b.type === 'id3-header');
    return findHeader ? findHeader.metatags : null;
};
exports.getMetadataFromMp3 = getMetadataFromMp3;
