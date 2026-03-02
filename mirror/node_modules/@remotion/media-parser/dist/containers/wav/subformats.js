"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subformatIsIeeeFloat = exports.subformatIsPcm = exports.KSDATAFORMAT_SUBTYPE_IEEE_FLOAT = exports.WMMEDIASUBTYPE_PCM = void 0;
exports.WMMEDIASUBTYPE_PCM = [
    1, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113,
];
exports.KSDATAFORMAT_SUBTYPE_IEEE_FLOAT = [
    3, 0, 0, 0, 0, 0, 16, 0, 128, 0, 0, 170, 0, 56, 155, 113,
];
const subformatIsPcm = (subformat) => {
    return subformat.every((value, index) => value === exports.WMMEDIASUBTYPE_PCM[index]);
};
exports.subformatIsPcm = subformatIsPcm;
const subformatIsIeeeFloat = (subformat) => {
    return subformat.every((value, index) => value === exports.KSDATAFORMAT_SUBTYPE_IEEE_FLOAT[index]);
};
exports.subformatIsIeeeFloat = subformatIsIeeeFloat;
