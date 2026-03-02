"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChunks = void 0;
const getChunks = (playlist) => {
    const chunks = [];
    for (let i = 0; i < playlist.boxes.length; i++) {
        const box = playlist.boxes[i];
        if (box.type === 'm3u-map') {
            chunks.push({ duration: 0, url: box.value, isHeader: true });
            continue;
        }
        if (box.type === 'm3u-extinf') {
            const nextBox = playlist.boxes[i + 1];
            i++;
            if (nextBox.type !== 'm3u-text-value') {
                throw new Error('Expected m3u-text-value');
            }
            chunks.push({ duration: box.value, url: nextBox.value, isHeader: false });
        }
        continue;
    }
    return chunks;
};
exports.getChunks = getChunks;
