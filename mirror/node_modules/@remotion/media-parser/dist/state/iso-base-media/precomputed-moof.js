"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deduplicateMoofBoxesByOffset = exports.toMoofBox = exports.precomputedMoofState = void 0;
// Note: May be duplicated!
const precomputedMoofState = () => {
    let moofBoxes = [];
    return {
        getMoofBoxes: () => moofBoxes,
        setMoofBoxes: (boxes) => {
            moofBoxes = boxes;
        },
    };
};
exports.precomputedMoofState = precomputedMoofState;
const toMoofBox = (box) => {
    if (box.type !== 'regular-box') {
        throw new Error('expected regular bpx');
    }
    return {
        offset: box.offset,
        trafBoxes: box.children.filter((c) => c.type === 'regular-box' && c.boxType === 'traf'),
        size: box.boxSize,
    };
};
exports.toMoofBox = toMoofBox;
const deduplicateMoofBoxesByOffset = (moofBoxes) => {
    return moofBoxes.filter((m, i, arr) => i === arr.findIndex((t) => t.offset === m.offset));
};
exports.deduplicateMoofBoxesByOffset = deduplicateMoofBoxesByOffset;
