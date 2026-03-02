"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRiff = void 0;
const parse_riff_body_1 = require("./parse-riff-body");
const parse_riff_header_1 = require("./parse-riff-header");
const parseRiff = (state) => {
    if (state.iterator.counter.getOffset() === 0) {
        return Promise.resolve((0, parse_riff_header_1.parseRiffHeader)(state));
    }
    return (0, parse_riff_body_1.parseRiffBody)(state);
};
exports.parseRiff = parseRiff;
