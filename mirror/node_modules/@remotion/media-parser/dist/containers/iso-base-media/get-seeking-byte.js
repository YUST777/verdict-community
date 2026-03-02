"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByteFromIsoBaseMedia = void 0;
const get_tracks_1 = require("../../get-tracks");
const log_1 = require("../../log");
const find_keyframe_before_time_1 = require("./find-keyframe-before-time");
const find_track_to_seek_1 = require("./find-track-to-seek");
const get_seeking_byte_from_fragmented_mp4_1 = require("./get-seeking-byte-from-fragmented-mp4");
const traversal_1 = require("./traversal");
const getSeekingByteFromIsoBaseMedia = ({ info, time, logLevel, currentPosition, isoState, m3uPlaylistContext, structure, }) => {
    var _a, _b, _c;
    const tracks = (0, get_tracks_1.getTracksFromIsoBaseMedia)({
        isoState,
        m3uPlaylistContext,
        structure,
        mayUsePrecomputed: false,
    });
    const hasMoov = Boolean((0, traversal_1.getMoovBoxFromState)({
        structureState: structure,
        isoState,
        mayUsePrecomputed: false,
        mp4HeaderSegment: (_a = m3uPlaylistContext === null || m3uPlaylistContext === void 0 ? void 0 : m3uPlaylistContext.mp4HeaderSegment) !== null && _a !== void 0 ? _a : null,
    }));
    if (!hasMoov) {
        log_1.Log.trace(logLevel, 'No moov box found, must wait');
        return Promise.resolve({
            type: 'valid-but-must-wait',
        });
    }
    if (info.moofBoxes.length > 0) {
        return (0, get_seeking_byte_from_fragmented_mp4_1.getSeekingByteFromFragmentedMp4)({
            info,
            time,
            logLevel,
            currentPosition,
            isoState,
            tracks,
            isLastChunkInPlaylist: (_b = m3uPlaylistContext === null || m3uPlaylistContext === void 0 ? void 0 : m3uPlaylistContext.isLastChunkInPlaylist) !== null && _b !== void 0 ? _b : false,
            structure,
            mp4HeaderSegment: (_c = m3uPlaylistContext === null || m3uPlaylistContext === void 0 ? void 0 : m3uPlaylistContext.mp4HeaderSegment) !== null && _c !== void 0 ? _c : null,
        });
    }
    const trackWithSamplePositions = (0, find_track_to_seek_1.findTrackToSeek)(tracks, structure);
    if (!trackWithSamplePositions) {
        return Promise.resolve({
            type: 'valid-but-must-wait',
        });
    }
    const { track, samplePositions } = trackWithSamplePositions;
    const keyframe = (0, find_keyframe_before_time_1.findKeyframeBeforeTime)({
        samplePositions,
        time,
        timescale: track.originalTimescale,
        logLevel,
        mediaSections: info.mediaSections,
        startInSeconds: track.startInSeconds,
    });
    if (keyframe) {
        return Promise.resolve({
            type: 'do-seek',
            byte: keyframe.offset,
            timeInSeconds: Math.min(keyframe.decodingTimestamp, keyframe.timestamp) /
                track.originalTimescale,
        });
    }
    return Promise.resolve({
        type: 'invalid',
    });
};
exports.getSeekingByteFromIsoBaseMedia = getSeekingByteFromIsoBaseMedia;
