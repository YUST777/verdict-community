"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseM3u8Text = void 0;
const parse_directive_1 = require("./parse-directive");
const parseM3u8Text = (line, boxes) => {
    if (line === '#EXTM3U') {
        boxes.push({
            type: 'm3u-header',
        });
        return;
    }
    if (line.startsWith('#')) {
        boxes.push((0, parse_directive_1.parseM3uDirective)(line));
        return;
    }
    if (line.trim()) {
        boxes.push({
            type: 'm3u-text-value',
            value: line,
        });
    }
};
exports.parseM3u8Text = parseM3u8Text;
