"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMatroskaColorBytes = void 0;
const truthy_1 = require("../../truthy");
const matroska_utils_1 = require("./matroska-utils");
const getRangeValue = ({ transferCharacteristics, matrixCoefficients, fullRange, }) => {
    return transferCharacteristics && matrixCoefficients
        ? 3
        : fullRange === true
            ? 2
            : fullRange === false
                ? 1
                : 0;
};
// https://w3c.github.io/webcodecs/#videocolorprimaries
const getPrimariesValue = (primaries) => {
    if (primaries === null) {
        return null;
    }
    if (primaries === 'bt709') {
        return 1;
    }
    if (primaries === 'bt470bg') {
        return 5;
    }
    if (primaries === 'smpte170m') {
        return 6;
    }
    if (primaries === 'bt2020') {
        return 9;
    }
    if (primaries === 'smpte432') {
        return 12;
    }
    throw new Error('Unknown primaries ' + primaries);
};
const getTransferCharacteristicsValue = (transferCharacteristics) => {
    if (transferCharacteristics === null) {
        return null;
    }
    if (transferCharacteristics === 'bt709') {
        return 1;
    }
    if (transferCharacteristics === 'smpte170m') {
        return 6;
    }
    if (transferCharacteristics === 'iec61966-2-1') {
        return 13;
    }
    if (transferCharacteristics === 'linear') {
        return 8;
    }
    if (transferCharacteristics === 'pq') {
        return 16;
    }
    if (transferCharacteristics === 'hlg') {
        return 18;
    }
    throw new Error('Unknown transfer characteristics ' +
        transferCharacteristics);
};
const getMatrixCoefficientsValue = (matrixCoefficients) => {
    if (matrixCoefficients === null) {
        return null;
    }
    if (matrixCoefficients === 'rgb') {
        return 0;
    }
    if (matrixCoefficients === 'bt709') {
        return 1;
    }
    if (matrixCoefficients === 'bt470bg') {
        return 5;
    }
    if (matrixCoefficients === 'smpte170m') {
        return 6;
    }
    if (matrixCoefficients === 'bt2020-ncl') {
        return 9;
    }
    throw new Error('Unknown matrix coefficients ' + matrixCoefficients);
};
const makeMatroskaColorBytes = ({ transfer: transferCharacteristics, matrix: matrixCoefficients, primaries, fullRange, }) => {
    const rangeValue = getRangeValue({
        transferCharacteristics,
        matrixCoefficients,
        fullRange,
    });
    // https://datatracker.ietf.org/doc/draft-ietf-cellar-matroska/
    // 5.1.4.1.28.27
    const primariesValue = getPrimariesValue(primaries);
    const transferChracteristicsValue = getTransferCharacteristicsValue(transferCharacteristics);
    if (matrixCoefficients === 'rgb') {
        throw new Error('Cannot encode Matroska in RGB');
    }
    const matrixCoefficientsValue = getMatrixCoefficientsValue(matrixCoefficients);
    return (0, matroska_utils_1.makeMatroskaBytes)({
        type: 'Colour',
        minVintWidth: null,
        value: [
            transferChracteristicsValue === null
                ? null
                : {
                    type: 'TransferCharacteristics',
                    value: {
                        value: transferChracteristicsValue,
                        byteLength: null,
                    },
                    minVintWidth: null,
                },
            matrixCoefficientsValue === null
                ? null
                : {
                    type: 'MatrixCoefficients',
                    value: {
                        value: matrixCoefficientsValue,
                        byteLength: null,
                    },
                    minVintWidth: null,
                },
            primariesValue === null
                ? null
                : {
                    type: 'Primaries',
                    value: {
                        value: primariesValue,
                        byteLength: null,
                    },
                    minVintWidth: null,
                },
            {
                type: 'Range',
                value: {
                    value: rangeValue,
                    byteLength: null,
                },
                minVintWidth: null,
            },
        ].filter(truthy_1.truthy),
    });
};
exports.makeMatroskaColorBytes = makeMatroskaColorBytes;
