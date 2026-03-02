"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByteFromFragmentedMp4 = void 0;
const log_1 = require("../../log");
const video_section_1 = require("../../state/video-section");
const are_samples_complete_1 = require("./are-samples-complete");
const collect_sample_positions_from_moof_boxes_1 = require("./collect-sample-positions-from-moof-boxes");
const find_keyframe_before_time_1 = require("./find-keyframe-before-time");
const get_sample_position_bounds_1 = require("./get-sample-position-bounds");
const find_best_segment_from_tfra_1 = require("./mfra/find-best-segment-from-tfra");
const traversal_1 = require("./traversal");
const getSeekingByteFromFragmentedMp4 = async ({ info, time, logLevel, currentPosition, isoState, tracks, isLastChunkInPlaylist, structure, mp4HeaderSegment, }) => {
    const firstVideoTrack = tracks.find((t) => t.type === 'video');
    // If there is both video and audio, seek based on video, but if not then audio is also okay
    const firstTrack = firstVideoTrack !== null && firstVideoTrack !== void 0 ? firstVideoTrack : tracks.find((t) => t.type === 'audio');
    if (!firstTrack) {
        throw new Error('no video and no audio tracks');
    }
    const moov = (0, traversal_1.getMoovBoxFromState)({
        structureState: structure,
        isoState,
        mp4HeaderSegment,
        mayUsePrecomputed: true,
    });
    if (!moov) {
        throw new Error('No moov atom found');
    }
    const trakBox = (0, traversal_1.getTrakBoxByTrackId)(moov, firstTrack.trackId);
    if (!trakBox) {
        throw new Error('No trak box found');
    }
    const tkhdBox = (0, traversal_1.getTkhdBox)(trakBox);
    if (!tkhdBox) {
        throw new Error('Expected tkhd box in trak box');
    }
    const isComplete = (0, are_samples_complete_1.areSamplesComplete)({
        moofBoxes: info.moofBoxes,
        tfraBoxes: info.tfraBoxes,
    });
    const { samplePositions: samplePositionsArray } = (0, collect_sample_positions_from_moof_boxes_1.collectSamplePositionsFromMoofBoxes)({
        moofBoxes: info.moofBoxes,
        tkhdBox,
        isComplete,
        trexBoxes: (0, traversal_1.getTrexBoxes)(moov),
    });
    log_1.Log.trace(logLevel, 'Fragmented MP4 - Checking if we have seeking info for this time range');
    for (const positions of samplePositionsArray) {
        const { min, max } = (0, get_sample_position_bounds_1.getSamplePositionBounds)(positions.samples, firstTrack.originalTimescale);
        if (min <= time &&
            (positions.isLastFragment || isLastChunkInPlaylist || time <= max)) {
            log_1.Log.trace(logLevel, `Fragmented MP4 - Found that we have seeking info for this time range: ${min} <= ${time} <= ${max}`);
            const kf = (0, find_keyframe_before_time_1.findKeyframeBeforeTime)({
                samplePositions: positions.samples,
                time,
                timescale: firstTrack.originalTimescale,
                logLevel,
                mediaSections: info.mediaSections,
                startInSeconds: firstTrack.startInSeconds,
            });
            if (kf) {
                return {
                    type: 'do-seek',
                    byte: kf.offset,
                    timeInSeconds: Math.min(kf.decodingTimestamp, kf.timestamp) /
                        firstTrack.originalTimescale,
                };
            }
        }
    }
    const atom = await (info.mfraAlreadyLoaded
        ? Promise.resolve(info.mfraAlreadyLoaded)
        : isoState.mfra.triggerLoad());
    if (atom) {
        const moofOffset = (0, find_best_segment_from_tfra_1.findBestSegmentFromTfra)({
            mfra: atom,
            time,
            firstTrack,
            timescale: firstTrack.originalTimescale,
        });
        if (moofOffset !== null &&
            !(moofOffset.start <= currentPosition && currentPosition < moofOffset.end)) {
            log_1.Log.verbose(logLevel, `Fragmented MP4 - Found based on mfra information that we should seek to: ${moofOffset.start} ${moofOffset.end}`);
            return {
                type: 'intermediary-seek',
                byte: moofOffset.start,
            };
        }
    }
    log_1.Log.trace(logLevel, 'Fragmented MP4 - No seeking info found for this time range.');
    if ((0, video_section_1.isByteInMediaSection)({
        position: currentPosition,
        mediaSections: info.mediaSections,
    }) !== 'in-section') {
        return {
            type: 'valid-but-must-wait',
        };
    }
    log_1.Log.trace(logLevel, 'Fragmented MP4 - Inside the wrong video section, skipping to the end of the section');
    const mediaSection = (0, video_section_1.getCurrentMediaSection)({
        offset: currentPosition,
        mediaSections: info.mediaSections,
    });
    if (!mediaSection) {
        throw new Error('No video section defined');
    }
    return {
        type: 'intermediary-seek',
        byte: mediaSection.start + mediaSection.size,
    };
};
exports.getSeekingByteFromFragmentedMp4 = getSeekingByteFromFragmentedMp4;
