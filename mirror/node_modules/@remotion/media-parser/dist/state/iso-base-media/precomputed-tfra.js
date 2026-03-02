"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deduplicateTfraBoxesByOffset = exports.precomputedTfraState = void 0;
const precomputedTfraState = () => {
    let tfraBoxes = [];
    return {
        getTfraBoxes: () => tfraBoxes,
        setTfraBoxes: (boxes) => {
            tfraBoxes = boxes;
        },
    };
};
exports.precomputedTfraState = precomputedTfraState;
const deduplicateTfraBoxesByOffset = (tfraBoxes) => {
    return tfraBoxes.filter((m, i, arr) => i === arr.findIndex((t) => t.offset === m.offset));
};
exports.deduplicateTfraBoxesByOffset = deduplicateTfraBoxesByOffset;
