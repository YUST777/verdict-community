"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVideoTrackWhenProfileIsAvailable = exports.registerAudioTrack = exports.registerVideoTrack = void 0;
const add_avc_profile_to_track_1 = require("./add-avc-profile-to-track");
const log_1 = require("./log");
const registerVideoTrack = async ({ track, container, logLevel, onVideoTrack, registerVideoSampleCallback, tracks, }) => {
    if (tracks.getTracks().find((t) => t.trackId === track.trackId)) {
        log_1.Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
        return null;
    }
    if (track.type !== 'video') {
        throw new Error('Expected video track');
    }
    tracks.addTrack(track);
    if (!onVideoTrack) {
        return null;
    }
    const callback = await onVideoTrack({
        track,
        container,
    });
    await registerVideoSampleCallback(track.trackId, callback !== null && callback !== void 0 ? callback : null);
    return callback;
};
exports.registerVideoTrack = registerVideoTrack;
const registerAudioTrack = async ({ track, container, tracks, logLevel, onAudioTrack, registerAudioSampleCallback, }) => {
    if (tracks.getTracks().find((t) => t.trackId === track.trackId)) {
        log_1.Log.trace(logLevel, `Track ${track.trackId} already registered, skipping`);
        return null;
    }
    if (track.type !== 'audio') {
        throw new Error('Expected audio track');
    }
    tracks.addTrack(track);
    if (!onAudioTrack) {
        return null;
    }
    const callback = await onAudioTrack({
        track,
        container,
    });
    await registerAudioSampleCallback(track.trackId, callback !== null && callback !== void 0 ? callback : null);
    return callback;
};
exports.registerAudioTrack = registerAudioTrack;
const registerVideoTrackWhenProfileIsAvailable = ({ state, track, container, }) => {
    state.riff.registerOnAvcProfileCallback(async (profile) => {
        await (0, exports.registerVideoTrack)({
            track: (0, add_avc_profile_to_track_1.addAvcProfileToTrack)(track, profile),
            container,
            logLevel: state.logLevel,
            onVideoTrack: state.onVideoTrack,
            registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
            tracks: state.callbacks.tracks,
        });
    });
};
exports.registerVideoTrackWhenProfileIsAvailable = registerVideoTrackWhenProfileIsAvailable;
