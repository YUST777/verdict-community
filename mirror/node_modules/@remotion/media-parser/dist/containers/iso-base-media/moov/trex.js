"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTrex = void 0;
const parseTrex = ({ iterator, offset, size, }) => {
    const box = iterator.startBox(size - 8);
    const version = iterator.getUint8();
    // Flags, we discard them
    iterator.discard(3);
    const trackId = iterator.getUint32();
    const defaultSampleDescriptionIndex = iterator.getUint32();
    const defaultSampleDuration = iterator.getUint32();
    const defaultSampleSize = iterator.getUint32();
    const defaultSampleFlags = iterator.getUint32();
    box.expectNoMoreBytes();
    return {
        type: 'trex-box',
        boxSize: size,
        offset,
        trackId,
        version,
        defaultSampleDescriptionIndex,
        defaultSampleDuration,
        defaultSampleSize,
        defaultSampleFlags,
    };
};
exports.parseTrex = parseTrex;
