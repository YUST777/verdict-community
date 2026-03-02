"use strict";
// Cannot do WAV yet, because currently assumes AAC in+outpoint
Object.defineProperty(exports, "__esModule", { value: true });
exports.canConcatVideoSeamlessly = exports.canConcatAudioSeamlessly = void 0;
const canConcatAudioSeamlessly = (audioCodec, chunkDurationInFrames) => {
    // Rendering a chunk that is too small generates too much overhead
    // and is currently buggy
    if (chunkDurationInFrames <= 4) {
        return false;
    }
    return audioCodec === 'aac';
};
exports.canConcatAudioSeamlessly = canConcatAudioSeamlessly;
const canConcatVideoSeamlessly = (codec) => {
    return codec === 'h264';
};
exports.canConcatVideoSeamlessly = canConcatVideoSeamlessly;
