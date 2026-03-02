"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekPointFromXing = void 0;
const get_duration_1 = require("../get-duration");
const parse_xing_1 = require("../parse-xing");
const samples_per_mpeg_file_1 = require("../samples-per-mpeg-file");
const getSeekPointFromXing = ({ timeInSeconds, xingData, mp3Info, }) => {
    const samplesPerFrame = (0, samples_per_mpeg_file_1.getSamplesPerMpegFrame)({
        layer: mp3Info.layer,
        mpegVersion: mp3Info.mpegVersion,
    });
    const duration = (0, get_duration_1.getDurationFromMp3Xing)({
        xingData,
        samplesPerFrame,
    });
    const totalSamples = timeInSeconds * xingData.sampleRate;
    // -1 frame so we are sure to be before the target
    const oneFrameSubtracted = totalSamples - samplesPerFrame;
    const timeToTarget = Math.max(0, oneFrameSubtracted / xingData.sampleRate);
    if (!xingData.fileSize || !xingData.tableOfContents) {
        throw new Error('Cannot seek of VBR MP3 file');
    }
    return (0, parse_xing_1.getSeekPointInBytes)({
        fileSize: xingData.fileSize,
        percentBetween0And100: (timeToTarget / duration) * 100,
        tableOfContents: xingData.tableOfContents,
    });
};
exports.getSeekPointFromXing = getSeekPointFromXing;
