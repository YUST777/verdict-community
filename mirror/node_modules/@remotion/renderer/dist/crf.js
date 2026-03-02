"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQualitySettings = exports.getValidCrfRanges = exports.getDefaultCrfForCodec = void 0;
const is_audio_codec_1 = require("./is-audio-codec");
const defaultCrfMap = {
    h264: 18,
    h265: 23,
    vp8: 9,
    vp9: 28,
    prores: null,
    gif: null,
    'h264-mkv': 18,
    'h264-ts': 18,
    aac: null,
    mp3: null,
    wav: null,
};
const getDefaultCrfForCodec = (codec) => {
    const val = defaultCrfMap[codec];
    if (val === undefined) {
        throw new TypeError(`Got unexpected codec "${codec}"`);
    }
    return val;
};
exports.getDefaultCrfForCodec = getDefaultCrfForCodec;
const crfRanges = {
    h264: [1, 51],
    h265: [0, 51],
    vp8: [4, 63],
    vp9: [0, 63],
    prores: [0, 0],
    gif: [0, 0],
    'h264-mkv': [1, 51],
    'h264-ts': [1, 51],
    aac: [0, 0],
    mp3: [0, 0],
    wav: [0, 0],
};
const getValidCrfRanges = (codec) => {
    const val = crfRanges[codec];
    if (val === undefined) {
        throw new TypeError(`Got unexpected codec "${codec}"`);
    }
    return val;
};
exports.getValidCrfRanges = getValidCrfRanges;
const validateQualitySettings = ({ codec, crf, videoBitrate, encodingMaxRate, encodingBufferSize, hardwareAcceleration, }) => {
    if (crf && videoBitrate) {
        throw new Error('"crf" and "videoBitrate" can not both be set. Choose one of either.');
    }
    if (crf && hardwareAcceleration === 'required') {
        throw new Error('"crf" option is not supported with hardware acceleration');
    }
    if (encodingMaxRate && !encodingBufferSize) {
        throw new Error('"encodingMaxRate" can not be set without also setting "encodingBufferSize".');
    }
    const bufSizeArray = encodingBufferSize
        ? ['-bufsize', encodingBufferSize]
        : [];
    const maxRateArray = encodingMaxRate ? ['-maxrate', encodingMaxRate] : [];
    if (videoBitrate) {
        if (codec === 'prores') {
            console.warn('ProRes does not support videoBitrate. Ignoring.');
            return [];
        }
        if ((0, is_audio_codec_1.isAudioCodec)(codec)) {
            console.warn(`${codec} does not support videoBitrate. Ignoring.`);
            return [];
        }
        return ['-b:v', videoBitrate, ...bufSizeArray, ...maxRateArray];
    }
    if (crf === null || typeof crf === 'undefined') {
        const actualCrf = (0, exports.getDefaultCrfForCodec)(codec);
        if (actualCrf === null) {
            return [...bufSizeArray, ...maxRateArray];
        }
        return ['-crf', String(actualCrf), ...bufSizeArray, ...maxRateArray];
    }
    if (typeof crf !== 'number') {
        throw new TypeError('Expected CRF to be a number, but is ' + JSON.stringify(crf));
    }
    const range = (0, exports.getValidCrfRanges)(codec);
    if (crf === 0 &&
        (codec === 'h264' || codec === 'h264-mkv' || codec === 'h264-ts')) {
        throw new TypeError("Setting the CRF to 0 with a H264 codec is not supported anymore because of it's inconsistencies between platforms. Videos with CRF 0 cannot be played on iOS/macOS. 0 is a extreme value with inefficient settings which you probably do not want. Set CRF to a higher value to fix this error.");
    }
    if (crf < range[0] || crf > range[1]) {
        if (range[0] === 0 && range[1] === 0) {
            throw new TypeError(`The "${codec}" codec does not support the --crf option.`);
        }
        throw new TypeError(`CRF must be between ${range[0]} and ${range[1]} for codec ${codec}. Passed: ${crf}`);
    }
    if (codec === 'prores') {
        console.warn('ProRes does not support the "crf" option. Ignoring.');
        return [];
    }
    if ((0, is_audio_codec_1.isAudioCodec)(codec)) {
        console.warn(`${codec} does not support the "crf" option. Ignoring.`);
        return [];
    }
    return ['-crf', String(crf), ...bufSizeArray, ...maxRateArray];
};
exports.validateQualitySettings = validateQualitySettings;
