"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForWav = exports.getSeekingHintsFromWav = void 0;
const getSeekingHintsFromWav = ({ structure, mediaSectionState, }) => {
    const fmtBox = structure.boxes.find((box) => box.type === 'wav-fmt');
    if (!fmtBox) {
        return null;
    }
    const mediaSection = mediaSectionState.getMediaSections();
    if (mediaSection.length !== 1) {
        return null;
    }
    return {
        type: 'wav-seeking-hints',
        sampleRate: fmtBox.sampleRate,
        blockAlign: fmtBox.blockAlign,
        mediaSection: mediaSection[0],
    };
};
exports.getSeekingHintsFromWav = getSeekingHintsFromWav;
const setSeekingHintsForWav = ({ hints, state, }) => {
    // abstaining from setting fmt box, usually it is at the very beginning
    state.mediaSection.addMediaSection(hints.mediaSection);
};
exports.setSeekingHintsForWav = setSeekingHintsForWav;
