"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePasp = void 0;
const parsePasp = ({ iterator, offset, size, }) => {
    const hSpacing = iterator.getUint32();
    const vSpacing = iterator.getUint32();
    const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);
    iterator.discard(bytesRemainingInBox);
    return {
        type: 'pasp-box',
        boxSize: size,
        offset,
        hSpacing,
        vSpacing,
    };
};
exports.parsePasp = parsePasp;
