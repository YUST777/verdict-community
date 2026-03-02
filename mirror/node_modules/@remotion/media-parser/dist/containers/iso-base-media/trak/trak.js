"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTrak = void 0;
const get_children_1 = require("../get-children");
const parseTrak = async ({ size, offsetAtStart, iterator, logLevel, contentLength, }) => {
    const children = await (0, get_children_1.getIsoBaseMediaChildren)({
        onlyIfMoovAtomExpected: null,
        size: size - 8,
        iterator,
        logLevel,
        contentLength,
    });
    return {
        offset: offsetAtStart,
        boxSize: size,
        type: 'trak-box',
        children,
    };
};
exports.parseTrak = parseTrak;
