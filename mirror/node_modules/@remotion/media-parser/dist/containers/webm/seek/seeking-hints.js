"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForWebm = exports.getSeekingHintsFromMatroska = void 0;
const getSeekingHintsFromMatroska = (tracksState, keyframesState, webmState) => {
    const tracks = tracksState.getTracks();
    const firstVideoTrack = tracks.find((track) => track.type === 'video');
    const keyframes = keyframesState.getKeyframes();
    const loadedCues = webmState.cues.getIfAlreadyLoaded();
    return {
        type: 'webm-seeking-hints',
        track: firstVideoTrack
            ? {
                timescale: firstVideoTrack.originalTimescale,
                trackId: firstVideoTrack.trackId,
            }
            : null,
        keyframes,
        loadedCues,
        timestampMap: webmState.getTimeStampMapForSeekingHints(),
    };
};
exports.getSeekingHintsFromMatroska = getSeekingHintsFromMatroska;
const setSeekingHintsForWebm = ({ hints, state, }) => {
    state.webm.cues.setFromSeekingHints(hints);
    state.keyframes.setFromSeekingHints(hints.keyframes);
    state.webm.setTimeStampMapForSeekingHints(hints.timestampMap);
};
exports.setSeekingHintsForWebm = setSeekingHintsForWebm;
