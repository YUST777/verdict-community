"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioSampleFromCbr = void 0;
const webcodecs_timescale_1 = require("../../../webcodecs-timescale");
const get_frame_length_1 = require("../get-frame-length");
const getAudioSampleFromCbr = ({ bitrateInKbit, initialOffset, layer, sampleRate, samplesPerFrame, data, state, }) => {
    const avgLength = (0, get_frame_length_1.getAverageMpegFrameLength)({
        bitrateKbit: bitrateInKbit,
        layer,
        samplesPerFrame,
        samplingFrequency: sampleRate,
    });
    const mp3Info = state.mp3.getMp3Info();
    if (!mp3Info) {
        throw new Error('No MP3 info');
    }
    const nthFrame = Math.round((initialOffset - state.mediaSection.getMediaSectionAssertOnlyOne().start) /
        avgLength);
    const durationInSeconds = samplesPerFrame / sampleRate;
    const timeInSeconds = (nthFrame * samplesPerFrame) / sampleRate;
    // Important that we round down, otherwise WebCodecs might stall, e.g.
    // Last input = 30570667 Last output = 30570666 -> stuck
    const timestamp = Math.floor(timeInSeconds * webcodecs_timescale_1.WEBCODECS_TIMESCALE);
    const duration = Math.floor(durationInSeconds * webcodecs_timescale_1.WEBCODECS_TIMESCALE);
    const audioSample = {
        data,
        decodingTimestamp: timestamp,
        duration,
        offset: initialOffset,
        timestamp,
        type: 'key',
    };
    return { audioSample, timeInSeconds, durationInSeconds };
};
exports.getAudioSampleFromCbr = getAudioSampleFromCbr;
