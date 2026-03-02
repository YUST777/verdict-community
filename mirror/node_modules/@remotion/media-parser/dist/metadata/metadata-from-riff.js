"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFromRiff = void 0;
const truthy_1 = require("../truthy");
const getMetadataFromRiff = (structure) => {
    const boxes = structure.boxes.find((b) => b.type === 'list-box' && b.listType === 'INFO');
    if (!boxes) {
        return [];
    }
    const { children } = boxes;
    return children
        .map((child) => {
        if (child.type !== 'isft-box') {
            return null;
        }
        return {
            trackId: null,
            key: 'encoder',
            value: child.software,
        };
    })
        .filter(truthy_1.truthy);
};
exports.getMetadataFromRiff = getMetadataFromRiff;
