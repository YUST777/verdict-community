"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSlowDuration = exports.hasDuration = exports.getDuration = exports.isMatroska = void 0;
const get_duration_from_flac_1 = require("./containers/flac/get-duration-from-flac");
const are_samples_complete_1 = require("./containers/iso-base-media/are-samples-complete");
const get_sample_positions_from_track_1 = require("./containers/iso-base-media/get-sample-positions-from-track");
const traversal_1 = require("./containers/iso-base-media/traversal");
const get_duration_from_m3u_1 = require("./containers/m3u/get-duration-from-m3u");
const get_duration_1 = require("./containers/mp3/get-duration");
const get_duration_2 = require("./containers/riff/get-duration");
const get_duration_from_wav_1 = require("./containers/wav/get-duration-from-wav");
const get_tracks_1 = require("./get-tracks");
const precomputed_tfra_1 = require("./state/iso-base-media/precomputed-tfra");
const getDurationFromMatroska = (segments) => {
    const mainSegment = segments.find((s) => s.type === 'Segment');
    if (!mainSegment || mainSegment.type !== 'Segment') {
        return null;
    }
    const { value: children } = mainSegment;
    if (!children) {
        return null;
    }
    const infoSegment = children.find((s) => s.type === 'Info');
    const relevantBoxes = [
        ...mainSegment.value,
        ...(infoSegment && infoSegment.type === 'Info' ? infoSegment.value : []),
    ];
    const timestampScale = relevantBoxes.find((s) => s.type === 'TimestampScale');
    if (!timestampScale || timestampScale.type !== 'TimestampScale') {
        return null;
    }
    const duration = relevantBoxes.find((s) => s.type === 'Duration');
    if (!duration || duration.type !== 'Duration') {
        return null;
    }
    return (duration.value.value / timestampScale.value.value) * 1000;
};
const isMatroska = (boxes) => {
    const matroskaBox = boxes.find((b) => b.type === 'Segment');
    return matroskaBox;
};
exports.isMatroska = isMatroska;
const getDurationFromIsoBaseMedia = (parserState) => {
    var _a, _b;
    const structure = parserState.structure.getIsoStructure();
    const moovBox = (0, traversal_1.getMoovBoxFromState)({
        structureState: parserState.structure,
        isoState: parserState.iso,
        mp4HeaderSegment: (_b = (_a = parserState.m3uPlaylistContext) === null || _a === void 0 ? void 0 : _a.mp4HeaderSegment) !== null && _b !== void 0 ? _b : null,
        mayUsePrecomputed: true,
    });
    if (!moovBox) {
        return null;
    }
    const moofBoxes = (0, traversal_1.getMoofBoxes)(structure.boxes);
    const mfra = parserState.iso.mfra.getIfAlreadyLoaded();
    const tfraBoxes = (0, precomputed_tfra_1.deduplicateTfraBoxesByOffset)([
        ...(mfra ? (0, traversal_1.getTfraBoxesFromMfraBoxChildren)(mfra) : []),
        ...(0, traversal_1.getTfraBoxes)(structure.boxes),
    ]);
    if (!(0, are_samples_complete_1.areSamplesComplete)({ moofBoxes, tfraBoxes })) {
        return null;
    }
    const mvhdBox = (0, traversal_1.getMvhdBox)(moovBox);
    if (!mvhdBox) {
        return null;
    }
    if (mvhdBox.type !== 'mvhd-box') {
        throw new Error('Expected mvhd-box');
    }
    if (mvhdBox.durationInSeconds > 0) {
        return mvhdBox.durationInSeconds;
    }
    const tracks = (0, get_tracks_1.getTracks)(parserState, true);
    const allSamples = tracks.map((t) => {
        const { originalTimescale: ts } = t;
        const trakBox = (0, traversal_1.getTrakBoxByTrackId)(moovBox, t.trackId);
        if (!trakBox) {
            return null;
        }
        const { samplePositions, isComplete } = (0, get_sample_positions_from_track_1.getSamplePositionsFromTrack)({
            trakBox,
            moofBoxes,
            moofComplete: (0, are_samples_complete_1.areSamplesComplete)({ moofBoxes, tfraBoxes }),
            trexBoxes: (0, traversal_1.getTrexBoxes)(moovBox),
        });
        if (!isComplete) {
            return null;
        }
        if (samplePositions.length === 0) {
            return null;
        }
        const highest = samplePositions === null || samplePositions === void 0 ? void 0 : samplePositions.map((sp) => (sp.timestamp + sp.duration) / ts).reduce((a, b) => Math.max(a, b), 0);
        return highest !== null && highest !== void 0 ? highest : 0;
    });
    if (allSamples.every((s) => s === null)) {
        return null;
    }
    const highestTimestamp = Math.max(...allSamples.filter((s) => s !== null));
    return highestTimestamp;
};
const getDuration = (parserState) => {
    const structure = parserState.structure.getStructure();
    if (structure.type === 'matroska') {
        return getDurationFromMatroska(structure.boxes);
    }
    if (structure.type === 'iso-base-media') {
        return getDurationFromIsoBaseMedia(parserState);
    }
    if (structure.type === 'riff') {
        return (0, get_duration_2.getDurationFromAvi)(structure);
    }
    if (structure.type === 'transport-stream') {
        return null;
    }
    if (structure.type === 'mp3') {
        return (0, get_duration_1.getDurationFromMp3)(parserState);
    }
    if (structure.type === 'wav') {
        return (0, get_duration_from_wav_1.getDurationFromWav)(parserState);
    }
    if (structure.type === 'aac') {
        return null;
    }
    if (structure.type === 'flac') {
        return (0, get_duration_from_flac_1.getDurationFromFlac)(parserState);
    }
    if (structure.type === 'm3u') {
        return (0, get_duration_from_m3u_1.getDurationFromM3u)(parserState);
    }
    throw new Error('Has no duration ' + structure);
};
exports.getDuration = getDuration;
// `duration` just grabs from metadata, and otherwise returns null
// Therefore just checking if we have tracks
const hasDuration = (parserState) => {
    const structure = parserState.structure.getStructureOrNull();
    if (structure === null) {
        return false;
    }
    return (0, get_tracks_1.getHasTracks)(parserState, true);
};
exports.hasDuration = hasDuration;
// `slowDuration` goes through everything, and therefore is false
// Unless it it somewhere in the metadata and is non-null
const hasSlowDuration = (parserState) => {
    try {
        if (!(0, exports.hasDuration)(parserState)) {
            return false;
        }
        return (0, exports.getDuration)(parserState) !== null;
    }
    catch (_a) {
        return false;
    }
};
exports.hasSlowDuration = hasSlowDuration;
