"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationFromMp3 = exports.getDurationFromMp3Xing = void 0;
const get_frame_length_1 = require("./get-frame-length");
const samples_per_mpeg_file_1 = require("./samples-per-mpeg-file");
const getDurationFromMp3Xing = ({ xingData, samplesPerFrame, }) => {
    const xingFrames = xingData.numberOfFrames;
    if (!xingFrames) {
        throw new Error('Cannot get duration of VBR MP3 file - no frames');
    }
    const { sampleRate } = xingData;
    if (!sampleRate) {
        throw new Error('Cannot get duration of VBR MP3 file - no sample rate');
    }
    const xingSamples = xingFrames * samplesPerFrame;
    return xingSamples / sampleRate;
};
exports.getDurationFromMp3Xing = getDurationFromMp3Xing;
const getDurationFromMp3 = (state) => {
    const mp3Info = state.mp3.getMp3Info();
    const mp3BitrateInfo = state.mp3.getMp3BitrateInfo();
    if (!mp3Info || !mp3BitrateInfo) {
        return null;
    }
    const samplesPerFrame = (0, samples_per_mpeg_file_1.getSamplesPerMpegFrame)({
        layer: mp3Info.layer,
        mpegVersion: mp3Info.mpegVersion,
    });
    if (mp3BitrateInfo.type === 'variable') {
        return (0, exports.getDurationFromMp3Xing)({
            xingData: mp3BitrateInfo.xingData,
            samplesPerFrame,
        });
    }
    /**
     * sonnet: The variation between 1044 and 1045 bytes in MP3 frames occurs due to the bit reservoir mechanism in MP3 encoding. Here's the typical distribution:
     * •	1044 bytes (99% of frames)
     * •	1045 bytes (1% of frames)
     */
    // we ignore that fact for now
    const frameLengthInBytes = (0, get_frame_length_1.getMpegFrameLength)({
        bitrateKbit: mp3BitrateInfo.bitrateInKbit,
        padding: false,
        samplesPerFrame,
        samplingFrequency: mp3Info.sampleRate,
        layer: mp3Info.layer,
    });
    const frames = Math.floor((state.contentLength -
        state.mediaSection.getMediaSectionAssertOnlyOne().start) /
        frameLengthInBytes);
    const samples = frames * samplesPerFrame;
    const durationInSeconds = samples / mp3Info.sampleRate;
    return durationInSeconds;
};
exports.getDurationFromMp3 = getDurationFromMp3;
