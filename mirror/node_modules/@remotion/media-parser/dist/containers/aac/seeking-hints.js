"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForAac = exports.getSeekingHintsForAac = void 0;
const getSeekingHintsForAac = ({ aacState, samplesObserved, }) => {
    return {
        type: 'aac-seeking-hints',
        audioSampleMap: aacState.audioSamples.getSamples(),
        lastSampleObserved: samplesObserved.getLastSampleObserved(),
    };
};
exports.getSeekingHintsForAac = getSeekingHintsForAac;
// TODO: Implement this and maintain index
const setSeekingHintsForAac = () => { };
exports.setSeekingHintsForAac = setSeekingHintsForAac;
