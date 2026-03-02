"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasNumberOfAudioChannels = exports.getNumberOfAudioChannels = void 0;
const getNumberOfAudioChannels = (state) => {
    var _a, _b;
    return ((_b = (_a = state.callbacks.tracks.getTracks().find((track) => {
        return track.type === 'audio';
    })) === null || _a === void 0 ? void 0 : _a.numberOfChannels) !== null && _b !== void 0 ? _b : null);
};
exports.getNumberOfAudioChannels = getNumberOfAudioChannels;
const hasNumberOfAudioChannels = (state) => {
    return state.callbacks.tracks.hasAllTracks();
};
exports.hasNumberOfAudioChannels = hasNumberOfAudioChannels;
