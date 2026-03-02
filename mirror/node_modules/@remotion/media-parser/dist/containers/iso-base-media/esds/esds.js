"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEsds = void 0;
const esds_descriptors_1 = require("./esds-descriptors");
const parseEsds = ({ data, size, fileOffset, }) => {
    const version = data.getUint8();
    // Flags, we discard them
    data.discard(3);
    const tag = data.getUint8();
    const sizeOfInstance = data.getPaddedFourByteNumber();
    const esId = data.getUint16();
    // disard 1 byte, currently unknown
    data.discard(1);
    const remaining = size - (data.counter.getOffset() - fileOffset);
    const descriptors = (0, esds_descriptors_1.parseDescriptors)(data, remaining);
    const remainingNow = size - (data.counter.getOffset() - fileOffset);
    data.discard(remainingNow);
    return {
        type: 'esds-box',
        version,
        tag,
        sizeOfInstance,
        esId,
        descriptors,
    };
};
exports.parseEsds = parseEsds;
