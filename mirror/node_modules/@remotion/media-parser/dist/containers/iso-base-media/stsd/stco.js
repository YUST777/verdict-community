"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStco = void 0;
const parseStco = ({ iterator, offset, size, mode64Bit, }) => {
    const version = iterator.getUint8();
    if (version !== 0) {
        throw new Error(`Unsupported STSD version ${version}`);
    }
    const flags = iterator.getSlice(3);
    const entryCount = iterator.getUint32();
    const entries = [];
    for (let i = 0; i < entryCount; i++) {
        const bytesRemaining = size - (iterator.counter.getOffset() - offset);
        if (bytesRemaining < 4) {
            break;
        }
        entries.push(mode64Bit ? iterator.getUint64() : iterator.getUint32());
    }
    iterator.discard(size - (iterator.counter.getOffset() - offset));
    return {
        type: 'stco-box',
        boxSize: size,
        offset,
        version,
        flags: [...flags],
        entries,
        entryCount,
    };
};
exports.parseStco = parseStco;
