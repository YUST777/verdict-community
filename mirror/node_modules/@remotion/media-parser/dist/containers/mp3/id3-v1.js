"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseID3V1 = void 0;
const parseID3V1 = (iterator) => {
    if (iterator.bytesRemaining() < 128) {
        return;
    }
    // we drop ID3v1 because usually there is also ID3v2 and ID3v3 which are superior.
    // Better than have duplicated data.
    iterator.discard(128);
};
exports.parseID3V1 = parseID3V1;
