"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStrhForIndex = void 0;
const traversal_1 = require("./traversal");
const getStrhForIndex = (structure, trackId) => {
    const boxes = (0, traversal_1.getStrlBoxes)(structure);
    const box = boxes[trackId];
    if (!box) {
        throw new Error('Expected box');
    }
    const strh = (0, traversal_1.getStrhBox)(box.children);
    if (!strh) {
        throw new Error('strh');
    }
    return strh;
};
exports.getStrhForIndex = getStrhForIndex;
