"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVideo = void 0;
const traversal_1 = require("./containers/iso-base-media/traversal");
const errors_1 = require("./errors");
const get_tracks_1 = require("./get-tracks");
const log_1 = require("./log");
const register_track_1 = require("./register-track");
const initVideo = async ({ state }) => {
    var _a;
    const fileType = state.iterator.detectFileType();
    const { mimeType, name, contentLength } = state;
    if (fileType.type === 'riff') {
        log_1.Log.verbose(state.logLevel, 'Detected RIFF container');
        state.structure.setStructure({
            type: 'riff',
            boxes: [],
        });
        return;
    }
    if ((_a = state.m3uPlaylistContext) === null || _a === void 0 ? void 0 : _a.mp4HeaderSegment) {
        log_1.Log.verbose(state.logLevel, 'Detected ISO Base Media segment');
        const moovAtom = (0, traversal_1.getMoovFromFromIsoStructure)(state.m3uPlaylistContext.mp4HeaderSegment);
        if (!moovAtom) {
            throw new Error('No moov box found');
        }
        const tracks = (0, get_tracks_1.getTracksFromMoovBox)(moovAtom);
        for (const track of tracks.filter((t) => t.type === 'video')) {
            await (0, register_track_1.registerVideoTrack)({
                track,
                container: 'mp4',
                logLevel: state.logLevel,
                onVideoTrack: state.onVideoTrack,
                registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
                tracks: state.callbacks.tracks,
            });
        }
        for (const track of tracks.filter((t) => t.type === 'audio')) {
            await (0, register_track_1.registerAudioTrack)({
                track,
                container: 'mp4',
                registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
                tracks: state.callbacks.tracks,
                logLevel: state.logLevel,
                onAudioTrack: state.onAudioTrack,
            });
        }
        state.callbacks.tracks.setIsDone(state.logLevel);
        state.structure.setStructure({
            type: 'iso-base-media',
            boxes: [],
        });
        return;
    }
    if (fileType.type === 'iso-base-media') {
        log_1.Log.verbose(state.logLevel, 'Detected ISO Base Media container');
        state.structure.setStructure({
            type: 'iso-base-media',
            boxes: [],
        });
        return;
    }
    if (fileType.type === 'webm') {
        log_1.Log.verbose(state.logLevel, 'Detected Matroska container');
        state.structure.setStructure({
            boxes: [],
            type: 'matroska',
        });
        return;
    }
    if (fileType.type === 'transport-stream') {
        log_1.Log.verbose(state.logLevel, 'Detected MPEG-2 Transport Stream');
        state.mediaSection.addMediaSection({
            start: 0,
            size: contentLength,
        });
        state.structure.setStructure({
            boxes: [],
            type: 'transport-stream',
        });
        return;
    }
    if (fileType.type === 'mp3') {
        log_1.Log.verbose(state.logLevel, 'Detected MP3');
        const structure = {
            boxes: [],
            type: 'mp3',
        };
        state.structure.setStructure(structure);
        return;
    }
    if (fileType.type === 'wav') {
        log_1.Log.verbose(state.logLevel, 'Detected WAV');
        const structure = {
            boxes: [],
            type: 'wav',
        };
        state.structure.setStructure(structure);
        return;
    }
    if (fileType.type === 'flac') {
        log_1.Log.verbose(state.logLevel, 'Detected FLAC');
        const structure = {
            boxes: [],
            type: 'flac',
        };
        state.structure.setStructure(structure);
        return;
    }
    if (fileType.type === 'aac') {
        log_1.Log.verbose(state.logLevel, 'Detected AAC');
        state.structure.setStructure({
            type: 'aac',
            boxes: [],
        });
        return;
    }
    if (fileType.type === 'm3u') {
        log_1.Log.verbose(state.logLevel, 'Detected M3U');
        state.structure.setStructure({
            type: 'm3u',
            boxes: [],
        });
        return;
    }
    if (fileType.type === 'pdf') {
        return Promise.reject(new errors_1.IsAPdfError({
            message: 'GIF files are not supported',
            mimeType,
            sizeInBytes: contentLength,
            fileName: name,
        }));
    }
    if (fileType.type === 'bmp' ||
        fileType.type === 'jpeg' ||
        fileType.type === 'png' ||
        fileType.type === 'webp' ||
        fileType.type === 'gif') {
        return Promise.reject(new errors_1.IsAnImageError({
            message: 'Image files are not supported',
            imageType: fileType.type,
            dimensions: fileType.dimensions,
            mimeType,
            sizeInBytes: contentLength,
            fileName: name,
        }));
    }
    if (fileType.type === 'unknown') {
        return Promise.reject(new errors_1.IsAnUnsupportedFileTypeError({
            message: 'Unknown file format',
            mimeType,
            sizeInBytes: contentLength,
            fileName: name,
        }));
    }
    return Promise.reject(new Error('Unknown video format ' + fileType));
};
exports.initVideo = initVideo;
