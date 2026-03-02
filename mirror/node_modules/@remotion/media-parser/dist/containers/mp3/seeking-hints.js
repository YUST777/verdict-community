"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForMp3 = exports.getSeekingHintsForMp3 = void 0;
const getSeekingHintsForMp3 = ({ mp3State, samplesObserved, mediaSectionState, contentLength, }) => {
    var _a;
    return {
        type: 'mp3-seeking-hints',
        audioSampleMap: mp3State.audioSamples.getSamples(),
        lastSampleObserved: samplesObserved.getLastSampleObserved(),
        mp3BitrateInfo: mp3State.getMp3BitrateInfo(),
        mp3Info: mp3State.getMp3Info(),
        mediaSection: (_a = mediaSectionState.getMediaSections()[0]) !== null && _a !== void 0 ? _a : null,
        contentLength,
    };
};
exports.getSeekingHintsForMp3 = getSeekingHintsForMp3;
// TODO: could set xing data in the hints
const setSeekingHintsForMp3 = ({ hints, state, }) => {
    state.mp3.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};
exports.setSeekingHintsForMp3 = setSeekingHintsForMp3;
