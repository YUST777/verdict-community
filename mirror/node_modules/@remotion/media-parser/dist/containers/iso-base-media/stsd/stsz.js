"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStsz = void 0;
const parseStsz = ({ iterator, offset, size, }) => {
    const version = iterator.getUint8();
    if (version !== 0) {
        throw new Error(`Unsupported STSD version ${version}`);
    }
    const flags = iterator.getSlice(3);
    const sampleSize = iterator.getUint32();
    const sampleCount = iterator.getUint32();
    if (sampleSize !== 0) {
        return {
            type: 'stsz-box',
            boxSize: size,
            offset,
            version,
            flags: [...flags],
            sampleCount,
            countType: 'fixed',
            sampleSize,
        };
    }
    const samples = [];
    for (let i = 0; i < sampleCount; i++) {
        const bytesRemaining = size - (iterator.counter.getOffset() - offset);
        if (bytesRemaining < 4) {
            break;
        }
        samples.push(iterator.getUint32());
    }
    iterator.discard(size - (iterator.counter.getOffset() - offset));
    return {
        type: 'stsz-box',
        boxSize: size,
        offset,
        version,
        flags: [...flags],
        sampleCount,
        countType: 'variable',
        entries: samples,
    };
};
exports.parseStsz = parseStsz;
