"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMebx = void 0;
const get_children_1 = require("../get-children");
const parseMebx = async ({ offset, size, iterator, logLevel, contentLength, }) => {
    // reserved, 6 bit
    iterator.discard(6);
    const dataReferenceIndex = iterator.getUint16();
    const children = await (0, get_children_1.getIsoBaseMediaChildren)({
        iterator,
        size: size - 8,
        logLevel,
        onlyIfMoovAtomExpected: null,
        contentLength,
    });
    return {
        type: 'mebx-box',
        boxSize: size,
        offset,
        dataReferenceIndex,
        format: 'mebx',
        children,
    };
};
exports.parseMebx = parseMebx;
