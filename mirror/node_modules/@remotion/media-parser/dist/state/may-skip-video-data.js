"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maySkipOverSamplesInTheMiddle = exports.maySkipVideoData = exports.missesMatroskaTracks = void 0;
const get_ready_tracks_1 = require("../containers/webm/get-ready-tracks");
const traversal_1 = require("../containers/webm/traversal");
const need_samples_for_fields_1 = require("./need-samples-for-fields");
const getHasCallbacks = (state) => {
    const hasNoTrackHandlers = !state.callbacks.hasAudioTrackHandlers &&
        !state.callbacks.hasVideoTrackHandlers;
    if (hasNoTrackHandlers) {
        return false;
    }
    const hasAllTracksAndNoCallbacks = !state.callbacks.tracks.hasAllTracks() ||
        Object.values(state.callbacks.videoSampleCallbacks).length > 0 ||
        Object.values(state.callbacks.audioSampleCallbacks).length > 0;
    return hasAllTracksAndNoCallbacks;
};
const missesMatroskaTracks = (state) => {
    const struct = state.structure.getStructureOrNull();
    if (struct === null) {
        return false;
    }
    if (struct.type !== 'matroska') {
        return false;
    }
    const mainSegment = (0, traversal_1.getMainSegment)(struct.boxes);
    if (mainSegment === null) {
        return false;
    }
    return ((0, get_ready_tracks_1.getTracksFromMatroska)({
        structureState: state.structure,
        webmState: state.webm,
    }).missingInfo.length > 0);
};
exports.missesMatroskaTracks = missesMatroskaTracks;
const maySkipVideoData = ({ state }) => {
    const hasCallbacks = getHasCallbacks(state);
    return (!hasCallbacks &&
        !(0, need_samples_for_fields_1.needsToIterateOverSamples)({
            emittedFields: state.emittedFields,
            fields: state.fields,
        }) &&
        !(0, exports.missesMatroskaTracks)(state));
};
exports.maySkipVideoData = maySkipVideoData;
const maySkipOverSamplesInTheMiddle = ({ state, }) => {
    const hasCallbacks = getHasCallbacks(state);
    return (!hasCallbacks &&
        !(0, need_samples_for_fields_1.needsToIterateOverEverySample)({
            emittedFields: state.emittedFields,
            fields: state.fields,
        }));
};
exports.maySkipOverSamplesInTheMiddle = maySkipOverSamplesInTheMiddle;
