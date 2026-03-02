"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForFlac = exports.getSeekingHintsForFlac = void 0;
const getSeekingHintsForFlac = ({ flacState, samplesObserved, }) => {
    var _a;
    return {
        type: 'flac-seeking-hints',
        audioSampleMap: flacState.audioSamples.getSamples(),
        blockingBitStrategy: (_a = flacState.getBlockingBitStrategy()) !== null && _a !== void 0 ? _a : null,
        lastSampleObserved: samplesObserved.getLastSampleObserved(),
    };
};
exports.getSeekingHintsForFlac = getSeekingHintsForFlac;
const setSeekingHintsForFlac = ({ hints, state, }) => {
    if (hints.blockingBitStrategy !== null) {
        state.flac.setBlockingBitStrategy(hints.blockingBitStrategy);
    }
    state.flac.audioSamples.setFromSeekingHints(hints.audioSampleMap);
};
exports.setSeekingHintsForFlac = setSeekingHintsForFlac;
