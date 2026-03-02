"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColorParameterBox = void 0;
const parse_icc_profile_1 = require("../parse-icc-profile");
const parseColorParameterBox = ({ iterator, size, }) => {
    const byteString = iterator.getByteString(4, false);
    if (byteString === 'nclx') {
        const primaries = iterator.getUint16();
        const transfer = iterator.getUint16();
        const matrixIndex = iterator.getUint16();
        iterator.startReadingBits();
        const fullRangeFlag = Boolean(iterator.getBits(1));
        iterator.stopReadingBits();
        return {
            type: 'colr-box',
            colorType: 'transfer-characteristics',
            fullRangeFlag,
            matrixIndex,
            primaries,
            transfer,
        };
    }
    if (byteString === 'nclc') {
        const primaries = iterator.getUint16();
        const transfer = iterator.getUint16();
        const matrixIndex = iterator.getUint16();
        return {
            type: 'colr-box',
            colorType: 'transfer-characteristics',
            fullRangeFlag: false,
            matrixIndex,
            primaries,
            transfer,
        };
    }
    if (byteString === 'prof') {
        const profile = iterator.getSlice(size - 12);
        return {
            type: 'colr-box',
            colorType: 'icc-profile',
            profile,
            parsed: (0, parse_icc_profile_1.parseIccProfile)(profile),
        };
    }
    throw new Error('Unexpected box type ' + byteString);
};
exports.parseColorParameterBox = parseColorParameterBox;
