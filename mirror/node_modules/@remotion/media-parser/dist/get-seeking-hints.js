"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingHints = void 0;
const seeking_hints_1 = require("./containers/aac/seeking-hints");
const seeking_hints_2 = require("./containers/flac/seeking-hints");
const seeking_hints_3 = require("./containers/iso-base-media/seeking-hints");
const seeking_hints_4 = require("./containers/m3u/seeking-hints");
const seeking_hints_5 = require("./containers/mp3/seeking-hints");
const seeking_hints_6 = require("./containers/riff/seeking-hints");
const seeking_hints_7 = require("./containers/transport-stream/seeking-hints");
const seeking_hints_8 = require("./containers/wav/seeking-hints");
const seeking_hints_9 = require("./containers/webm/seek/seeking-hints");
const getSeekingHints = ({ structureState, m3uPlaylistContext, mediaSectionState, isoState, transportStream, tracksState, keyframesState, webmState, flacState, samplesObserved, riffState, mp3State, contentLength, aacState, }) => {
    var _a;
    const structure = structureState.getStructureOrNull();
    if (!structure) {
        return null;
    }
    if (structure.type === 'iso-base-media') {
        return (0, seeking_hints_3.getSeekingHintsFromMp4)({
            structureState,
            isoState,
            mp4HeaderSegment: (_a = m3uPlaylistContext === null || m3uPlaylistContext === void 0 ? void 0 : m3uPlaylistContext.mp4HeaderSegment) !== null && _a !== void 0 ? _a : null,
            mediaSectionState,
        });
    }
    if (structure.type === 'wav') {
        return (0, seeking_hints_8.getSeekingHintsFromWav)({
            structure,
            mediaSectionState,
        });
    }
    if (structure.type === 'matroska') {
        return (0, seeking_hints_9.getSeekingHintsFromMatroska)(tracksState, keyframesState, webmState);
    }
    if (structure.type === 'transport-stream') {
        return (0, seeking_hints_7.getSeekingHintsFromTransportStream)(transportStream, tracksState);
    }
    if (structure.type === 'flac') {
        return (0, seeking_hints_2.getSeekingHintsForFlac)({
            flacState,
            samplesObserved,
        });
    }
    if (structure.type === 'riff') {
        return (0, seeking_hints_6.getSeekingHintsForRiff)({
            structureState,
            riffState,
            mediaSectionState,
        });
    }
    if (structure.type === 'mp3') {
        return (0, seeking_hints_5.getSeekingHintsForMp3)({
            mp3State,
            samplesObserved,
            mediaSectionState,
            contentLength,
        });
    }
    if (structure.type === 'aac') {
        return (0, seeking_hints_1.getSeekingHintsForAac)({
            aacState,
            samplesObserved,
        });
    }
    if (structure.type === 'm3u') {
        return (0, seeking_hints_4.getSeekingHintsForM3u)();
    }
    throw new Error(`Seeking is not supported for this format: ${structure}`);
};
exports.getSeekingHints = getSeekingHints;
