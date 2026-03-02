"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioSampleFromVbr = void 0;
const webcodecs_timescale_1 = require("../../../webcodecs-timescale");
const get_duration_1 = require("../get-duration");
const parse_xing_1 = require("../parse-xing");
const samples_per_mpeg_file_1 = require("../samples-per-mpeg-file");
const getAudioSampleFromVbr = ({ info, position, mp3Info, data, }) => {
    if (!mp3Info) {
        throw new Error('No MP3 info');
    }
    const samplesPerFrame = (0, samples_per_mpeg_file_1.getSamplesPerMpegFrame)({
        layer: mp3Info.layer,
        mpegVersion: mp3Info.mpegVersion,
    });
    const wholeFileDuration = (0, get_duration_1.getDurationFromMp3Xing)({
        samplesPerFrame,
        xingData: info.xingData,
    });
    if (!info.xingData.fileSize) {
        throw new Error('file size');
    }
    if (!info.xingData.tableOfContents) {
        throw new Error('table of contents');
    }
    const timeInSeconds = (0, parse_xing_1.getTimeFromPosition)({
        durationInSeconds: wholeFileDuration,
        fileSize: info.xingData.fileSize,
        position,
        tableOfContents: info.xingData.tableOfContents,
    });
    const durationInSeconds = samplesPerFrame / info.xingData.sampleRate;
    const timestamp = Math.floor(timeInSeconds * webcodecs_timescale_1.WEBCODECS_TIMESCALE);
    const duration = Math.floor(durationInSeconds * webcodecs_timescale_1.WEBCODECS_TIMESCALE);
    const audioSample = {
        data,
        decodingTimestamp: timestamp,
        duration,
        offset: position,
        timestamp,
        type: 'key',
    };
    return { timeInSeconds, audioSample, durationInSeconds };
};
exports.getAudioSampleFromVbr = getAudioSampleFromVbr;
