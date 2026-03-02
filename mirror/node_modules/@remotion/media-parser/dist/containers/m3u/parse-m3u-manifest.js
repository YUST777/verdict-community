"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseM3uManifest = void 0;
const parse_m3u8_text_1 = require("./parse-m3u8-text");
const parseM3uManifest = ({ iterator, structure, contentLength, }) => {
    const start = iterator.startCheckpoint();
    const line = iterator.readUntilLineEnd();
    if (iterator.counter.getOffset() > contentLength) {
        throw new Error('Unexpected end of file');
    }
    if (line === null) {
        start.returnToCheckpoint();
        return Promise.resolve(null);
    }
    (0, parse_m3u8_text_1.parseM3u8Text)(line.trim(), structure.boxes);
    return Promise.resolve(null);
};
exports.parseM3uManifest = parseM3uManifest;
