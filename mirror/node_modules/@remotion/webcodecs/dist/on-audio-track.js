"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAudioTrackHandler = void 0;
const can_copy_audio_track_1 = require("./can-copy-audio-track");
const copy_audio_track_1 = require("./copy-audio-track");
const default_on_audio_track_handler_1 = require("./default-on-audio-track-handler");
const get_default_audio_codec_1 = require("./get-default-audio-codec");
const reencode_audio_track_1 = require("./reencode-audio-track");
const makeAudioTrackHandler = ({ state, defaultAudioCodec: audioCodec, controller, abortConversion, onMediaStateUpdate, onAudioTrack, logLevel, outputContainer, onAudioData, progressTracker, }) => async ({ track, container: inputContainer }) => {
    const canCopyTrack = (0, can_copy_audio_track_1.canCopyAudioTrack)({
        inputCodec: track.codecEnum,
        outputContainer,
        inputContainer,
        outputAudioCodec: audioCodec,
    });
    const audioOperation = await (onAudioTrack ?? default_on_audio_track_handler_1.defaultOnAudioTrackHandler)({
        defaultAudioCodec: audioCodec ?? (0, get_default_audio_codec_1.getDefaultAudioCodec)({ container: outputContainer }),
        track,
        logLevel,
        outputContainer,
        inputContainer,
        canCopyTrack,
    });
    if (audioOperation.type === 'drop') {
        return null;
    }
    if (audioOperation.type === 'fail') {
        throw new Error(`Audio track with ID ${track.trackId} resolved with {"type": "fail"}. This could mean that this audio track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`);
    }
    if (audioOperation.type === 'copy') {
        return (0, copy_audio_track_1.copyAudioTrack)({
            logLevel,
            onMediaStateUpdate,
            state,
            track,
            progressTracker,
        });
    }
    return (0, reencode_audio_track_1.reencodeAudioTrack)({
        abortConversion,
        controller,
        logLevel,
        onMediaStateUpdate,
        audioOperation,
        onAudioData,
        state,
        track,
        progressTracker,
    });
};
exports.makeAudioTrackHandler = makeAudioTrackHandler;
