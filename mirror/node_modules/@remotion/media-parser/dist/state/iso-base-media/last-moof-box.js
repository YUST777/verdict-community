"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxFirstMoofOffset = exports.getLastMoofBox = void 0;
const truthy_1 = require("../../truthy");
const getLastMoofBox = (boxes) => {
    if (boxes) {
        const tfras = boxes.filter((b) => b.type === 'tfra-box');
        const lastMoofOffsets = tfras.map((f) => {
            if (f.entries.length <= 1) {
                return null;
            }
            return f.entries[f.entries.length - 1].moofOffset;
        });
        if (lastMoofOffsets.length > 0) {
            const maxOffset = Math.max(...lastMoofOffsets.filter(truthy_1.truthy));
            return maxOffset;
        }
        return null;
    }
};
exports.getLastMoofBox = getLastMoofBox;
const getMaxFirstMoofOffset = (boxes) => {
    const tfras = boxes.filter((b) => b.type === 'tfra-box');
    const firstMoofOffsets = tfras.map((f) => {
        return f.entries[0].moofOffset;
    });
    return Math.max(...firstMoofOffsets.filter(truthy_1.truthy));
};
exports.getMaxFirstMoofOffset = getMaxFirstMoofOffset;
