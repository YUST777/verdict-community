"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isM3u = exports.isFlac = exports.isAac = exports.isMp3 = exports.isTransportStream = exports.isIsoBaseMedia = exports.isWebm = exports.isRiffWave = exports.isRiffAvi = exports.matchesPattern = void 0;
const webmPattern = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);
const matchesPattern = (pattern) => {
    return (data) => {
        return pattern.every((value, index) => data[index] === value);
    };
};
exports.matchesPattern = matchesPattern;
const isRiffAvi = (data) => {
    const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    if (!(0, exports.matchesPattern)(riffPattern)(data.subarray(0, 4))) {
        return false;
    }
    const fileType = data.subarray(8, 12);
    const aviPattern = new Uint8Array([0x41, 0x56, 0x49, 0x20]);
    return (0, exports.matchesPattern)(aviPattern)(fileType);
};
exports.isRiffAvi = isRiffAvi;
const isRiffWave = (data) => {
    const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    if (!(0, exports.matchesPattern)(riffPattern)(data.subarray(0, 4))) {
        return false;
    }
    const fileType = data.subarray(8, 12);
    const wavePattern = new Uint8Array([0x57, 0x41, 0x56, 0x45]);
    return (0, exports.matchesPattern)(wavePattern)(fileType);
};
exports.isRiffWave = isRiffWave;
const isWebm = (data) => {
    return (0, exports.matchesPattern)(webmPattern)(data.subarray(0, 4));
};
exports.isWebm = isWebm;
const isIsoBaseMedia = (data) => {
    const isoBaseMediaMp4Pattern = new TextEncoder().encode('ftyp');
    return (0, exports.matchesPattern)(isoBaseMediaMp4Pattern)(data.subarray(4, 8));
};
exports.isIsoBaseMedia = isIsoBaseMedia;
const isTransportStream = (data) => {
    return data[0] === 0x47 && data[188] === 0x47;
};
exports.isTransportStream = isTransportStream;
const isMp3 = (data) => {
    const mpegPattern = new Uint8Array([0xff, 0xf3]);
    const mpegPattern2 = new Uint8Array([0xff, 0xfb]);
    const id3v4Pattern = new Uint8Array([0x49, 0x44, 0x33, 4]);
    const id3v3Pattern = new Uint8Array([0x49, 0x44, 0x33, 3]);
    const id3v2Pattern = new Uint8Array([0x49, 0x44, 0x33, 2]);
    const subarray = data.subarray(0, 4);
    return ((0, exports.matchesPattern)(mpegPattern)(subarray) ||
        (0, exports.matchesPattern)(mpegPattern2)(subarray) ||
        (0, exports.matchesPattern)(id3v4Pattern)(subarray) ||
        (0, exports.matchesPattern)(id3v3Pattern)(subarray) ||
        (0, exports.matchesPattern)(id3v2Pattern)(subarray));
};
exports.isMp3 = isMp3;
const isAac = (data) => {
    const aacPattern = new Uint8Array([0xff, 0xf1]);
    return (0, exports.matchesPattern)(aacPattern)(data.subarray(0, 2));
};
exports.isAac = isAac;
const isFlac = (data) => {
    const flacPattern = new Uint8Array([0x66, 0x4c, 0x61, 0x43]);
    return (0, exports.matchesPattern)(flacPattern)(data.subarray(0, 4));
};
exports.isFlac = isFlac;
const isM3u = (data) => {
    return new TextDecoder('utf-8').decode(data.slice(0, 7)) === '#EXTM3U';
};
exports.isM3u = isM3u;
