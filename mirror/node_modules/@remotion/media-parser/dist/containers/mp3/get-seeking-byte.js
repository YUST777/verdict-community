"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByteForMp3 = void 0;
const get_approximate_byte_from_bitrate_1 = require("./seek/get-approximate-byte-from-bitrate");
const get_byte_from_observed_samples_1 = require("./seek/get-byte-from-observed-samples");
const get_seek_point_from_xing_1 = require("./seek/get-seek-point-from-xing");
const getSeekingByteForMp3 = ({ time, info, }) => {
    var _a;
    if (info.mp3BitrateInfo === null ||
        info.mp3Info === null ||
        info.mediaSection === null) {
        return {
            type: 'valid-but-must-wait',
        };
    }
    const approximateByte = (0, get_approximate_byte_from_bitrate_1.getApproximateByteFromBitrate)({
        mp3BitrateInfo: info.mp3BitrateInfo,
        timeInSeconds: time,
        mp3Info: info.mp3Info,
        mediaSection: info.mediaSection,
        contentLength: info.contentLength,
    });
    const bestAudioSample = (0, get_byte_from_observed_samples_1.getByteFromObservedSamples)({
        info,
        timeInSeconds: time,
    });
    const xingSeekPoint = info.mp3BitrateInfo.type === 'variable'
        ? (0, get_seek_point_from_xing_1.getSeekPointFromXing)({
            mp3Info: info.mp3Info,
            timeInSeconds: time,
            xingData: info.mp3BitrateInfo.xingData,
        })
        : null;
    const candidates = [
        approximateByte,
        (_a = bestAudioSample === null || bestAudioSample === void 0 ? void 0 : bestAudioSample.offset) !== null && _a !== void 0 ? _a : null,
        xingSeekPoint,
    ].filter((b) => b !== null);
    if (candidates.length === 0) {
        return {
            type: 'valid-but-must-wait',
        };
    }
    const byte = Math.max(...candidates);
    const timeInSeconds = byte === (bestAudioSample === null || bestAudioSample === void 0 ? void 0 : bestAudioSample.offset) ? bestAudioSample.timeInSeconds : time;
    return {
        type: 'do-seek',
        byte,
        timeInSeconds,
    };
};
exports.getSeekingByteForMp3 = getSeekingByteForMp3;
