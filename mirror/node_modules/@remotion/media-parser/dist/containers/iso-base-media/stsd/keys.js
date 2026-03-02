"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKeys = void 0;
const parseKeys = ({ iterator, offset, size, }) => {
    const box = iterator.startBox(size - 8);
    const version = iterator.getUint8();
    // flags
    iterator.discard(3);
    // entry_count
    const entryCount = iterator.getUint32();
    const entries = [];
    for (let i = 0; i < entryCount; i++) {
        // key_size
        const keySize = iterator.getUint32();
        const namespace = iterator.getAtom();
        const value = iterator.getByteString(keySize - 8, false);
        // data
        const entry = {
            keySize,
            namespace,
            value,
        };
        entries.push(entry);
    }
    box.discardRest();
    return {
        type: 'keys-box',
        boxSize: size,
        offset,
        version,
        entryCount,
        entries,
    };
};
exports.parseKeys = parseKeys;
