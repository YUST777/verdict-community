"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAllInfo = exports.getAvailableInfo = void 0;
const get_streams_1 = require("./containers/m3u/get-streams");
const get_audio_codec_1 = require("./get-audio-codec");
const get_container_1 = require("./get-container");
const get_dimensions_1 = require("./get-dimensions");
const get_duration_1 = require("./get-duration");
const get_fps_1 = require("./get-fps");
const get_is_hdr_1 = require("./get-is-hdr");
const get_keyframes_1 = require("./get-keyframes");
const get_number_of_audio_channels_1 = require("./get-number-of-audio-channels");
const get_sample_rate_1 = require("./get-sample-rate");
const get_tracks_1 = require("./get-tracks");
const get_video_codec_1 = require("./get-video-codec");
const get_metadata_1 = require("./metadata/get-metadata");
const may_skip_video_data_1 = require("./state/may-skip-video-data");
const getAvailableInfo = ({ state, }) => {
    const keys = Object.entries(state.fields).filter(([, value]) => value);
    const structure = state.structure.getStructureOrNull();
    const infos = keys.map(([_key]) => {
        const key = _key;
        if (key === 'slowStructure') {
            return false;
        }
        if (key === 'durationInSeconds') {
            return Boolean(structure && (0, get_duration_1.hasDuration)(state));
        }
        if (key === 'slowDurationInSeconds') {
            const res = Boolean(structure && (0, get_duration_1.hasSlowDuration)(state));
            return res;
        }
        if (key === 'dimensions' ||
            key === 'rotation' ||
            key === 'unrotatedDimensions') {
            return Boolean(structure && (0, get_dimensions_1.hasDimensions)(state));
        }
        if (key === 'fps') {
            return Boolean(structure && (0, get_fps_1.hasFps)(state));
        }
        if (key === 'slowFps') {
            // In case FPS is available an non-null, it also works for `slowFps`
            return Boolean(structure && (0, get_fps_1.hasFpsSuitedForSlowFps)(state));
        }
        if (key === 'isHdr') {
            return Boolean(structure && (0, get_is_hdr_1.hasHdr)(state));
        }
        if (key === 'videoCodec') {
            return Boolean(structure && (0, get_video_codec_1.hasVideoCodec)(state));
        }
        if (key === 'audioCodec') {
            return Boolean(structure && (0, get_audio_codec_1.hasAudioCodec)(state));
        }
        if (key === 'tracks') {
            return Boolean(structure && (0, get_tracks_1.getHasTracks)(state, true));
        }
        if (key === 'keyframes') {
            return Boolean(structure && (0, get_keyframes_1.hasKeyframes)(state));
        }
        if (key === 'internalStats') {
            return true;
        }
        if (key === 'size') {
            return true;
        }
        if (key === 'mimeType') {
            return true;
        }
        if (key === 'name') {
            return true;
        }
        if (key === 'container') {
            return Boolean(structure && (0, get_container_1.hasContainer)(structure));
        }
        if (key === 'metadata' || key === 'location' || key === 'images') {
            return Boolean(structure && (0, get_metadata_1.hasMetadata)(structure));
        }
        if (key === 'slowKeyframes' ||
            key === 'slowVideoBitrate' ||
            key === 'slowAudioBitrate' ||
            key === 'slowNumberOfFrames') {
            return false;
        }
        if (key === 'numberOfAudioChannels') {
            return (0, get_number_of_audio_channels_1.hasNumberOfAudioChannels)(state);
        }
        if (key === 'sampleRate') {
            return (0, get_sample_rate_1.hasSampleRate)(state);
        }
        if (key === 'm3uStreams') {
            return (0, get_streams_1.m3uHasStreams)(state);
        }
        throw new Error(`Unknown field passed: ${key}. Available fields: ${Object.keys(state.fields).join(', ')}`);
    });
    const entries = [];
    let i = 0;
    for (const [key] of keys) {
        entries.push([key, infos[i++]]);
    }
    return Object.fromEntries(entries);
};
exports.getAvailableInfo = getAvailableInfo;
const hasAllInfo = ({ state }) => {
    const availableInfo = (0, exports.getAvailableInfo)({
        state,
    });
    if (!Object.values(availableInfo).every(Boolean)) {
        return false;
    }
    if ((0, may_skip_video_data_1.maySkipVideoData)({ state })) {
        return true;
    }
    if (state.callbacks.canSkipTracksState.canSkipTracks()) {
        return true;
    }
    return false;
};
exports.hasAllInfo = hasAllInfo;
