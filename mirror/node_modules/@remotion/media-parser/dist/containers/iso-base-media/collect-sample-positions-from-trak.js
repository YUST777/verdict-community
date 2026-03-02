"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSamplePositionsFromTrak = void 0;
const get_fps_1 = require("../../get-fps");
const get_sample_positions_1 = require("../../get-sample-positions");
const get_sample_positions_from_mp4_1 = require("../../get-sample-positions-from-mp4");
const should_group_audio_samples_1 = require("./should-group-audio-samples");
const traversal_1 = require("./traversal");
const collectSamplePositionsFromTrak = (trakBox) => {
    const shouldGroupSamples = (0, should_group_audio_samples_1.shouldGroupAudioSamples)(trakBox);
    const timescaleAndDuration = (0, get_fps_1.getTimescaleAndDuration)(trakBox);
    if (shouldGroupSamples) {
        return (0, get_sample_positions_from_mp4_1.getGroupedSamplesPositionsFromMp4)({
            trakBox,
            bigEndian: shouldGroupSamples.bigEndian,
        });
    }
    const stszBox = (0, traversal_1.getStszBox)(trakBox);
    const stcoBox = (0, traversal_1.getStcoBox)(trakBox);
    const stscBox = (0, traversal_1.getStscBox)(trakBox);
    const stssBox = (0, traversal_1.getStssBox)(trakBox);
    const sttsBox = (0, traversal_1.getSttsBox)(trakBox);
    const cttsBox = (0, traversal_1.getCttsBox)(trakBox);
    if (!stszBox) {
        throw new Error('Expected stsz box in trak box');
    }
    if (!stcoBox) {
        throw new Error('Expected stco box in trak box');
    }
    if (!stscBox) {
        throw new Error('Expected stsc box in trak box');
    }
    if (!sttsBox) {
        throw new Error('Expected stts box in trak box');
    }
    if (!timescaleAndDuration) {
        throw new Error('Expected timescale and duration in trak box');
    }
    const samplePositions = (0, get_sample_positions_1.getSamplePositions)({
        stcoBox,
        stscBox,
        stszBox,
        stssBox,
        sttsBox,
        cttsBox,
    });
    return samplePositions;
};
exports.collectSamplePositionsFromTrak = collectSamplePositionsFromTrak;
