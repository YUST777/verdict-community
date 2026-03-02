"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasDimensions = exports.getDimensions = void 0;
const get_tracks_1 = require("./get-tracks");
const is_audio_structure_1 = require("./is-audio-structure");
const getDimensions = (state) => {
    const structure = state.structure.getStructureOrNull();
    if (structure && (0, is_audio_structure_1.isAudioStructure)(structure)) {
        return null;
    }
    const tracks = (0, get_tracks_1.getTracks)(state, true);
    if (!tracks.length) {
        return null;
    }
    const firstVideoTrack = tracks.find((t) => t.type === 'video');
    if (!firstVideoTrack) {
        return null;
    }
    return {
        width: firstVideoTrack.width,
        height: firstVideoTrack.height,
        rotation: firstVideoTrack.rotation,
        unrotatedHeight: firstVideoTrack.displayAspectHeight,
        unrotatedWidth: firstVideoTrack.displayAspectWidth,
    };
};
exports.getDimensions = getDimensions;
const hasDimensions = (state) => {
    const structure = state.structure.getStructureOrNull();
    if (structure && (0, is_audio_structure_1.isAudioStructure)(structure)) {
        return true;
    }
    try {
        return (0, exports.getDimensions)(state) !== null;
    }
    catch (_a) {
        return false;
    }
};
exports.hasDimensions = hasDimensions;
