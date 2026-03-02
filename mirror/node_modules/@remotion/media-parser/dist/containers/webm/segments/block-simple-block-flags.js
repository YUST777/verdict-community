"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBlockFlags = void 0;
const all_segments_1 = require("./all-segments");
const parseBlockFlags = (iterator, type) => {
    if (type === all_segments_1.matroskaElements.Block) {
        iterator.startReadingBits();
        // Reserved
        iterator.getBits(4);
        const invisible = Boolean(iterator.getBits(1));
        const lacing = iterator.getBits(2);
        // unused
        iterator.getBits(1);
        iterator.stopReadingBits();
        return {
            invisible,
            lacing,
            keyframe: null,
        };
    }
    if (type === all_segments_1.matroskaElements.SimpleBlock) {
        iterator.startReadingBits();
        const keyframe = Boolean(iterator.getBits(1));
        // Reserved
        iterator.getBits(3);
        const invisible = Boolean(iterator.getBits(1));
        const lacing = iterator.getBits(2);
        iterator.getBits(1);
        iterator.stopReadingBits();
        return {
            invisible,
            lacing,
            keyframe,
        };
    }
    throw new Error('Unexpected type');
};
exports.parseBlockFlags = parseBlockFlags;
