"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIsft = void 0;
const parseIsft = ({ iterator, size, }) => {
    const { expectNoMoreBytes } = iterator.startBox(size);
    const software = iterator.getByteString(size - 1, false);
    const last = iterator.getUint8();
    if (last !== 0) {
        throw new Error(`Expected 0 byte, got ${last}`);
    }
    expectNoMoreBytes();
    return {
        type: 'isft-box',
        software,
    };
};
exports.parseIsft = parseIsft;
