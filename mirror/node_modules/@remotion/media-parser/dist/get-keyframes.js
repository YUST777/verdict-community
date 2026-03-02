"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasKeyframes = exports.getKeyframes = void 0;
const get_keyframes_1 = require("./containers/iso-base-media/get-keyframes");
const get_tracks_1 = require("./get-tracks");
const getKeyframes = (state) => {
    const structure = state.structure.getStructure();
    if (structure.type === 'iso-base-media') {
        return (0, get_keyframes_1.getKeyframesFromIsoBaseMedia)(state);
    }
    return null;
};
exports.getKeyframes = getKeyframes;
const hasKeyframes = (parserState) => {
    const structure = parserState.structure.getStructure();
    if (structure.type === 'iso-base-media') {
        return (0, get_tracks_1.getHasTracks)(parserState, true);
    }
    // Has, but will be null
    return true;
};
exports.hasKeyframes = hasKeyframes;
