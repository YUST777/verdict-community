"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForMp4 = exports.getSeekingHintsFromMp4 = void 0;
const precomputed_moof_1 = require("../../state/iso-base-media/precomputed-moof");
const precomputed_tfra_1 = require("../../state/iso-base-media/precomputed-tfra");
const traversal_1 = require("./traversal");
const getSeekingHintsFromMp4 = ({ structureState, isoState, mp4HeaderSegment, mediaSectionState, }) => {
    const structure = structureState.getIsoStructure();
    const moovAtom = (0, traversal_1.getMoovBoxFromState)({
        isoState,
        mp4HeaderSegment,
        structureState,
        mayUsePrecomputed: true,
    });
    const moofBoxes = (0, precomputed_moof_1.deduplicateMoofBoxesByOffset)([
        ...isoState.moof.getMoofBoxes(),
        ...(0, traversal_1.getMoofBoxes)(structure.boxes),
    ]);
    const tfraBoxes = (0, precomputed_tfra_1.deduplicateTfraBoxesByOffset)([
        ...isoState.tfra.getTfraBoxes(),
        ...(0, traversal_1.getTfraBoxes)(structure.boxes),
    ]);
    if (!moovAtom) {
        return null;
    }
    return {
        type: 'iso-base-media-seeking-hints',
        moovBox: moovAtom,
        moofBoxes,
        tfraBoxes,
        mediaSections: mediaSectionState.getMediaSections(),
        mfraAlreadyLoaded: isoState.mfra.getIfAlreadyLoaded(),
    };
};
exports.getSeekingHintsFromMp4 = getSeekingHintsFromMp4;
// eslint-disable-next-line no-empty-pattern
const setSeekingHintsForMp4 = ({}) => {
    // state.iso.moov.setMoovBox({
    //	moovBox: hints.moovBox,
    //	precomputed: true,
    // });
    // 	state.iso.mfra.setFromSeekingHints(hints);
    // state.iso.moof.setMoofBoxes(hints.moofBoxes);
    // TODO: Make use of these seeking hints and make tests pass
    /*
    //	state.iso.tfra.setTfraBoxes(hints.tfraBoxes);

    for (const mediaSection of hints.mediaSections) {
        // state.mediaSection.addMediaSection(mediaSection);
    }
    */
};
exports.setSeekingHintsForMp4 = setSeekingHintsForMp4;
