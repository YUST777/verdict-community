"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrimariesFromIndex = exports.getTransferCharacteristicsFromIndex = exports.getMatrixCoefficientsFromIndex = void 0;
const getMatrixCoefficientsFromIndex = (index) => {
    if (index === 0) {
        return 'rgb';
    }
    if (index === 1) {
        return 'bt709';
    }
    if (index === 5) {
        return 'bt470bg';
    }
    if (index === 6) {
        return 'smpte170m';
    }
    if (index === 9) {
        return 'bt2020-ncl';
    }
    return null;
};
exports.getMatrixCoefficientsFromIndex = getMatrixCoefficientsFromIndex;
// https://w3c.github.io/webcodecs/#videotransfercharacteristics
// But we may support more than that
const getTransferCharacteristicsFromIndex = (index) => {
    if (index === 1) {
        return 'bt709';
    }
    if (index === 6) {
        return 'smpte170m';
    }
    if (index === 8) {
        return 'linear';
    }
    if (index === 13) {
        return 'iec61966-2-1';
    }
    if (index === 16) {
        return 'pq';
    }
    if (index === 18) {
        return 'hlg';
    }
    return null;
};
exports.getTransferCharacteristicsFromIndex = getTransferCharacteristicsFromIndex;
const getPrimariesFromIndex = (index) => {
    if (index === 1) {
        return 'bt709';
    }
    if (index === 5) {
        return 'bt470bg';
    }
    if (index === 6) {
        return 'smpte170m';
    }
    if (index === 9) {
        return 'bt2020';
    }
    if (index === 12) {
        return 'smpte432';
    }
    return null;
};
exports.getPrimariesFromIndex = getPrimariesFromIndex;
