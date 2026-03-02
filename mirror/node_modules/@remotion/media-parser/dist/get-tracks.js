"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracks = exports.defaultHasallTracks = exports.defaultGetTracks = exports.getTracksFromIsoBaseMedia = exports.getTracksFromMoovBox = exports.getHasTracks = exports.isoBaseMediaHasTracks = exports.getNumberOfTracks = void 0;
const make_track_1 = require("./containers/iso-base-media/make-track");
const get_editlist_1 = require("./containers/iso-base-media/mdat/get-editlist");
const traversal_1 = require("./containers/iso-base-media/traversal");
const get_tracks_from_avi_1 = require("./containers/riff/get-tracks-from-avi");
const get_tracks_1 = require("./containers/transport-stream/get-tracks");
const get_ready_tracks_1 = require("./containers/webm/get-ready-tracks");
const getNumberOfTracks = (moovBox) => {
    const mvHdBox = (0, traversal_1.getMvhdBox)(moovBox);
    if (!mvHdBox) {
        return 0;
    }
    return mvHdBox.nextTrackId - 1;
};
exports.getNumberOfTracks = getNumberOfTracks;
const isoBaseMediaHasTracks = (state, mayUsePrecomputed) => {
    var _a, _b;
    return Boolean((0, traversal_1.getMoovBoxFromState)({
        structureState: state.structure,
        isoState: state.iso,
        mp4HeaderSegment: (_b = (_a = state.m3uPlaylistContext) === null || _a === void 0 ? void 0 : _a.mp4HeaderSegment) !== null && _b !== void 0 ? _b : null,
        mayUsePrecomputed,
    }));
};
exports.isoBaseMediaHasTracks = isoBaseMediaHasTracks;
const getHasTracks = (state, mayUsePrecomputed) => {
    const structure = state.structure.getStructure();
    if (structure.type === 'matroska') {
        return (0, get_ready_tracks_1.matroskaHasTracks)({
            structureState: state.structure,
            webmState: state.webm,
        });
    }
    if (structure.type === 'iso-base-media') {
        return (0, exports.isoBaseMediaHasTracks)(state, mayUsePrecomputed);
    }
    if (structure.type === 'riff') {
        return (0, get_tracks_from_avi_1.hasAllTracksFromAvi)(state);
    }
    if (structure.type === 'transport-stream') {
        return (0, get_tracks_1.hasAllTracksFromTransportStream)(state);
    }
    if (structure.type === 'mp3') {
        return state.callbacks.tracks.getTracks().length > 0;
    }
    if (structure.type === 'wav') {
        return state.callbacks.tracks.hasAllTracks();
    }
    if (structure.type === 'aac') {
        return state.callbacks.tracks.hasAllTracks();
    }
    if (structure.type === 'flac') {
        return state.callbacks.tracks.hasAllTracks();
    }
    if (structure.type === 'm3u') {
        return state.callbacks.tracks.hasAllTracks();
    }
    throw new Error('Unknown container ' + structure);
};
exports.getHasTracks = getHasTracks;
const getCategorizedTracksFromMatroska = (state) => {
    const { resolved } = (0, get_ready_tracks_1.getTracksFromMatroska)({
        structureState: state.structure,
        webmState: state.webm,
    });
    return resolved;
};
const getTracksFromMoovBox = (moovBox) => {
    const mediaParserTracks = [];
    const tracks = (0, traversal_1.getTraks)(moovBox);
    for (const trakBox of tracks) {
        const mvhdBox = (0, traversal_1.getMvhdBox)(moovBox);
        if (!mvhdBox) {
            throw new Error('Mvhd box is not found');
        }
        const startTime = (0, get_editlist_1.findTrackStartTimeInSeconds)({
            movieTimeScale: mvhdBox.timeScale,
            trakBox,
        });
        const track = (0, make_track_1.makeBaseMediaTrack)(trakBox, startTime);
        if (!track) {
            continue;
        }
        mediaParserTracks.push(track);
    }
    return mediaParserTracks;
};
exports.getTracksFromMoovBox = getTracksFromMoovBox;
const getTracksFromIsoBaseMedia = ({ mayUsePrecomputed, structure, isoState, m3uPlaylistContext, }) => {
    var _a;
    const moovBox = (0, traversal_1.getMoovBoxFromState)({
        structureState: structure,
        isoState,
        mp4HeaderSegment: (_a = m3uPlaylistContext === null || m3uPlaylistContext === void 0 ? void 0 : m3uPlaylistContext.mp4HeaderSegment) !== null && _a !== void 0 ? _a : null,
        mayUsePrecomputed,
    });
    if (!moovBox) {
        return [];
    }
    return (0, exports.getTracksFromMoovBox)(moovBox);
};
exports.getTracksFromIsoBaseMedia = getTracksFromIsoBaseMedia;
const defaultGetTracks = (parserState) => {
    const tracks = parserState.callbacks.tracks.getTracks();
    if (tracks.length === 0) {
        throw new Error('No tracks found');
    }
    return tracks;
};
exports.defaultGetTracks = defaultGetTracks;
const defaultHasallTracks = (parserState) => {
    try {
        (0, exports.defaultGetTracks)(parserState);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.defaultHasallTracks = defaultHasallTracks;
const getTracks = (state, mayUsePrecomputed) => {
    const structure = state.structure.getStructure();
    if (structure.type === 'matroska') {
        return getCategorizedTracksFromMatroska(state);
    }
    if (structure.type === 'iso-base-media') {
        return (0, exports.getTracksFromIsoBaseMedia)({
            isoState: state.iso,
            m3uPlaylistContext: state.m3uPlaylistContext,
            structure: state.structure,
            mayUsePrecomputed,
        });
    }
    if (structure.type === 'riff') {
        return (0, get_tracks_from_avi_1.getTracksFromAvi)(structure, state);
    }
    if (structure.type === 'transport-stream') {
        return (0, get_tracks_1.getTracksFromTransportStream)(state);
    }
    if (structure.type === 'mp3' ||
        structure.type === 'wav' ||
        structure.type === 'flac' ||
        structure.type === 'aac' ||
        structure.type === 'm3u') {
        return (0, exports.defaultGetTracks)(state);
    }
    throw new Error(`Unknown container${structure}`);
};
exports.getTracks = getTracks;
