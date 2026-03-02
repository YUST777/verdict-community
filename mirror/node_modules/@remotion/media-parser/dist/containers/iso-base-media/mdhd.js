"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMdhd = void 0;
const parseMdhd = ({ data, size, fileOffset, }) => {
    const version = data.getUint8();
    // flags, we discard them
    data.discard(3);
    // creation time
    const creationTime = version === 1 ? Number(data.getUint64()) : data.getUint32();
    // modification time
    const modificationTime = version === 1 ? Number(data.getUint64()) : data.getUint32();
    const timescale = data.getUint32();
    const duration = version === 1 ? data.getUint64() : data.getUint32();
    const language = data.getUint16();
    // quality
    const quality = data.getUint16();
    const remaining = size - (data.counter.getOffset() - fileOffset);
    if (remaining !== 0) {
        throw new Error(`Expected remaining bytes to be 0, got ${remaining}`);
    }
    return {
        type: 'mdhd-box',
        duration: Number(duration),
        timescale,
        version,
        language,
        quality,
        creationTime,
        modificationTime,
    };
};
exports.parseMdhd = parseMdhd;
