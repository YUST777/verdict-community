"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMediaSection = void 0;
const convert_audio_or_video_sample_1 = require("../../convert-audio-or-video-sample");
const get_seeking_byte_1 = require("./get-seeking-byte");
const parseMediaSection = async ({ state, }) => {
    const { iterator } = state;
    const structure = state.structure.getWavStructure();
    const videoSection = state.mediaSection.getMediaSectionAssertOnlyOne();
    const maxOffset = videoSection.start + videoSection.size;
    const maxRead = maxOffset - iterator.counter.getOffset();
    const offset = iterator.counter.getOffset();
    const fmtBox = structure.boxes.find((box) => box.type === 'wav-fmt');
    if (!fmtBox) {
        throw new Error('Expected fmt box');
    }
    const toRead = Math.min(maxRead, (fmtBox.sampleRate * fmtBox.blockAlign) / get_seeking_byte_1.WAVE_SAMPLES_PER_SECOND);
    const duration = toRead / (fmtBox.sampleRate * fmtBox.blockAlign);
    const timestamp = (offset - videoSection.start) / (fmtBox.sampleRate * fmtBox.blockAlign);
    const data = iterator.getSlice(toRead);
    const audioSample = (0, convert_audio_or_video_sample_1.convertAudioOrVideoSampleToWebCodecsTimestamps)({
        sample: {
            decodingTimestamp: timestamp,
            data,
            duration,
            timestamp,
            type: 'key',
            offset,
        },
        timescale: 1,
    });
    await state.callbacks.onAudioSample({
        audioSample,
        trackId: 0,
    });
    return null;
};
exports.parseMediaSection = parseMediaSection;
