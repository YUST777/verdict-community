"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIsoBaseMedia = void 0;
const mdat_1 = require("./mdat/mdat");
const process_box_1 = require("./process-box");
const parseIsoBaseMedia = async (state) => {
    const mediaSectionState = state.mediaSection.isCurrentByteInMediaSection(state.iterator);
    if (mediaSectionState === 'in-section') {
        const skipTo = await (0, mdat_1.parseMdatSection)(state);
        return skipTo;
    }
    const result = await (0, process_box_1.processBox)({
        iterator: state.iterator,
        logLevel: state.logLevel,
        onlyIfMoovAtomExpected: {
            tracks: state.callbacks.tracks,
            isoState: state.iso,
            movieTimeScaleState: state.iso.movieTimeScale,
            onAudioTrack: state.onAudioTrack,
            onVideoTrack: state.onVideoTrack,
            registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
            registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
        },
        onlyIfMdatAtomExpected: {
            mediaSectionState: state.mediaSection,
        },
        contentLength: state.contentLength,
    });
    if (result.type === 'fetch-more-data') {
        return result.bytesNeeded;
    }
    if (result.type === 'box') {
        state.structure.getIsoStructure().boxes.push(result.box);
    }
    return null;
};
exports.parseIsoBaseMedia = parseIsoBaseMedia;
