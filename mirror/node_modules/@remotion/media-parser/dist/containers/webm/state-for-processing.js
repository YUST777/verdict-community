"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectStatesForProcessing = void 0;
const selectStatesForProcessing = ({ callbacks, logLevel, onAudioTrack, onVideoTrack, structure, webm, avc, }) => {
    return {
        webmState: webm,
        callbacks,
        logLevel,
        onAudioTrack,
        onVideoTrack,
        structureState: structure,
        avcState: avc,
    };
};
exports.selectStatesForProcessing = selectStatesForProcessing;
