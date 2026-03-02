"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApproximateByteFromBitrate = void 0;
const get_frame_length_1 = require("../get-frame-length");
const samples_per_mpeg_file_1 = require("../samples-per-mpeg-file");
const getApproximateByteFromBitrate = ({ mp3BitrateInfo, timeInSeconds, mp3Info, mediaSection, contentLength, }) => {
    if (mp3BitrateInfo.type === 'variable') {
        return null;
    }
    const samplesPerFrame = (0, samples_per_mpeg_file_1.getSamplesPerMpegFrame)({
        layer: mp3Info.layer,
        mpegVersion: mp3Info.mpegVersion,
    });
    const frameLengthInBytes = (0, get_frame_length_1.getMpegFrameLength)({
        bitrateKbit: mp3BitrateInfo.bitrateInKbit,
        padding: false,
        samplesPerFrame,
        samplingFrequency: mp3Info.sampleRate,
        layer: mp3Info.layer,
    });
    const frameIndexUnclamped = Math.floor((timeInSeconds * mp3Info.sampleRate) / samplesPerFrame);
    const frames = Math.floor((contentLength - mediaSection.start) / frameLengthInBytes);
    const frameIndex = Math.min(frames - 1, frameIndexUnclamped);
    const byteRelativeToMediaSection = frameIndex * frameLengthInBytes;
    const byteBeforeFrame = byteRelativeToMediaSection + mediaSection.start;
    return byteBeforeFrame;
};
exports.getApproximateByteFromBitrate = getApproximateByteFromBitrate;
