"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStss = void 0;
const parseStss = ({ iterator, offset, boxSize, }) => {
    const version = iterator.getUint8();
    if (version !== 0) {
        throw new Error(`Unsupported STSS version ${version}`);
    }
    const flags = iterator.getSlice(3);
    const sampleCount = iterator.getUint32();
    const sampleNumber = new Set();
    for (let i = 0; i < sampleCount; i++) {
        sampleNumber.add(iterator.getUint32());
    }
    const bytesRemainingInBox = boxSize - (iterator.counter.getOffset() - offset);
    if (bytesRemainingInBox > 0) {
        iterator.discard(bytesRemainingInBox);
    }
    return {
        type: 'stss-box',
        version,
        flags: [...flags],
        sampleNumber,
        boxSize,
        offset,
    };
};
exports.parseStss = parseStss;
