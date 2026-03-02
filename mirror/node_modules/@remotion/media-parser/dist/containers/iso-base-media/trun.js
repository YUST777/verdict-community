"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTrun = void 0;
const parseTrun = ({ iterator, offset, size, }) => {
    const version = iterator.getUint8();
    if (version !== 0 && version !== 1) {
        throw new Error(`Unsupported TRUN version ${version}`);
    }
    const flags = iterator.getUint24();
    const sampleCount = iterator.getUint32();
    const dataOffset = flags & 0x01 ? iterator.getInt32() : null;
    const firstSampleFlags = flags & 0x04 ? iterator.getUint32() : null;
    const samples = [];
    for (let i = 0; i < sampleCount; i++) {
        const sampleDuration = flags & 0x100 ? iterator.getUint32() : null;
        const sampleSize = flags & 0x200 ? iterator.getUint32() : null;
        const sampleFlags = flags & 0x400 ? iterator.getUint32() : null;
        const sampleCompositionTimeOffset = flags & 0x800
            ? version === 0
                ? iterator.getUint32()
                : iterator.getInt32()
            : null;
        samples.push({
            sampleDuration,
            sampleSize,
            sampleFlags,
            sampleCompositionTimeOffset,
        });
    }
    const currentOffset = iterator.counter.getOffset();
    const left = size - (currentOffset - offset);
    if (left !== 0) {
        throw new Error(`Unexpected data left in TRUN box: ${left}`);
    }
    return {
        type: 'trun-box',
        version,
        sampleCount,
        dataOffset,
        firstSampleFlags,
        samples,
    };
};
exports.parseTrun = parseTrun;
