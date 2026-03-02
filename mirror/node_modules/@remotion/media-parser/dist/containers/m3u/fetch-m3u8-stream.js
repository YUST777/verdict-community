"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchM3u8Stream = void 0;
const parse_m3u8_text_1 = require("./parse-m3u8-text");
const fetchM3u8Stream = async ({ url, readerInterface, }) => {
    const text = await readerInterface.readWholeAsText(url);
    const lines = text.split('\n');
    const boxes = [];
    for (const line of lines) {
        (0, parse_m3u8_text_1.parseM3u8Text)(line.trim(), boxes);
    }
    return boxes;
};
exports.fetchM3u8Stream = fetchM3u8Stream;
