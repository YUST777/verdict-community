"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVpcc = void 0;
const getvp09ConfigurationString = ({ profile, level, bitDepth, }) => {
    return `${String(profile).padStart(2, '0')}.${String(level).padStart(2, '0')}.${String(bitDepth).padStart(2, '0')}`;
};
const parseVpcc = ({ data, size, }) => {
    const box = data.startBox(size - 8);
    const confVersion = data.getUint8();
    if (confVersion !== 1) {
        throw new Error(`Unsupported AVCC version ${confVersion}`);
    }
    data.discard(3); // flags
    const profile = data.getUint8();
    const level = data.getUint8();
    data.startReadingBits();
    const bitDepth = data.getBits(4);
    const chromaSubsampling = data.getBits(3);
    const videoFullRangeFlag = data.getBits(1);
    const videoColorPrimaries = data.getBits(8);
    const videoTransferCharacteristics = data.getBits(8);
    const videoMatrixCoefficients = data.getBits(8);
    data.stopReadingBits();
    const codecInitializationDataSize = data.getUint16();
    const codecInitializationData = data.getSlice(codecInitializationDataSize);
    box.expectNoMoreBytes();
    return {
        type: 'vpcc-box',
        profile,
        level,
        bitDepth,
        chromaSubsampling,
        videoFullRangeFlag,
        videoColorPrimaries,
        videoTransferCharacteristics,
        videoMatrixCoefficients,
        codecInitializationDataSize,
        codecInitializationData,
        codecString: getvp09ConfigurationString({ profile, level, bitDepth }),
    };
};
exports.parseVpcc = parseVpcc;
