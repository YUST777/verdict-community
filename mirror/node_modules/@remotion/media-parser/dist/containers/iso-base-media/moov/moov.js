"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMoov = void 0;
const get_children_1 = require("../get-children");
const parseMoov = async ({ offset, size, onlyIfMoovAtomExpected, iterator, logLevel, contentLength, }) => {
    const children = await (0, get_children_1.getIsoBaseMediaChildren)({
        onlyIfMoovAtomExpected,
        size: size - 8,
        iterator,
        logLevel,
        contentLength,
    });
    return {
        offset,
        boxSize: size,
        type: 'moov-box',
        children,
    };
};
exports.parseMoov = parseMoov;
