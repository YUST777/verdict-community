"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStsc = void 0;
const parseStsc = ({ iterator, offset, size, }) => {
    const version = iterator.getUint8();
    if (version !== 0) {
        throw new Error(`Unsupported STSD version ${version}`);
    }
    const flags = iterator.getSlice(3);
    const entryCount = iterator.getUint32();
    const entries = new Map();
    for (let i = 0; i < entryCount; i++) {
        const firstChunk = iterator.getUint32();
        const samplesPerChunk = iterator.getUint32();
        const sampleDescriptionIndex = iterator.getUint32();
        if (sampleDescriptionIndex !== 1) {
            throw new Error(`Expected sampleDescriptionIndex to be 1, but got ${sampleDescriptionIndex}`);
        }
        entries.set(firstChunk, samplesPerChunk);
    }
    return {
        type: 'stsc-box',
        boxSize: size,
        offset,
        version,
        flags: [...flags],
        entryCount,
        entries,
    };
};
exports.parseStsc = parseStsc;
