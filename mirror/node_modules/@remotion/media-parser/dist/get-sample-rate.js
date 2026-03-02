"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSampleRate = exports.getSampleRate = void 0;
const getSampleRate = (state) => {
    var _a, _b;
    return ((_b = (_a = state.callbacks.tracks.getTracks().find((track) => {
        return track.type === 'audio';
    })) === null || _a === void 0 ? void 0 : _a.sampleRate) !== null && _b !== void 0 ? _b : null);
};
exports.getSampleRate = getSampleRate;
const hasSampleRate = (state) => {
    return state.callbacks.tracks.hasAllTracks();
};
exports.hasSampleRate = hasSampleRate;
