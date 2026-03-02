"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForRiff = exports.getSeekingHintsForRiff = void 0;
const has_index_1 = require("./has-index");
const traversal_1 = require("./traversal");
const getSeekingHintsForRiff = ({ structureState, riffState, mediaSectionState, }) => {
    var _a, _b;
    const structure = structureState.getRiffStructure();
    const strl = (0, traversal_1.getStrlBoxes)(structure);
    let samplesPerSecond = null;
    for (const s of strl) {
        const strh = (0, traversal_1.getStrhBox)(s.children);
        if (!strh) {
            throw new Error('No strh box');
        }
        if (strh.strf.type !== 'strf-box-video') {
            continue;
        }
        samplesPerSecond = strh.rate / strh.scale;
        break;
    }
    return {
        type: 'riff-seeking-hints',
        hasIndex: (0, has_index_1.riffHasIndex)(structure),
        idx1Entries: riffState.lazyIdx1.getIfAlreadyLoaded(),
        samplesPerSecond,
        moviOffset: (_b = (_a = mediaSectionState.getMediaSections()[0]) === null || _a === void 0 ? void 0 : _a.start) !== null && _b !== void 0 ? _b : null,
        observedKeyframes: riffState.sampleCounter.riffKeys.getKeyframes(),
    };
};
exports.getSeekingHintsForRiff = getSeekingHintsForRiff;
const setSeekingHintsForRiff = ({ hints, state, }) => {
    state.riff.lazyIdx1.setFromSeekingHints(hints);
    state.riff.sampleCounter.riffKeys.setFromSeekingHints(hints.observedKeyframes);
};
exports.setSeekingHintsForRiff = setSeekingHintsForRiff;
