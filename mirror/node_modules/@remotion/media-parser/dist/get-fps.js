"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasFps = exports.hasFpsSuitedForSlowFps = exports.getFps = exports.getFpsFromMp4TrakBox = exports.getTimescaleAndDuration = exports.trakBoxContainsVideo = exports.trakBoxContainsAudio = void 0;
const traversal_1 = require("./containers/iso-base-media/traversal");
const traversal_2 = require("./containers/riff/traversal");
const is_audio_structure_1 = require("./is-audio-structure");
const calculateFps = ({ sttsBox, timeScale, durationInSamples, }) => {
    let totalSamples = 0;
    for (const sample of sttsBox.sampleDistribution) {
        totalSamples += sample.sampleCount;
    }
    if (totalSamples === 0) {
        return null;
    }
    const durationInSeconds = durationInSamples / timeScale;
    const fps = totalSamples / durationInSeconds;
    return fps;
};
const trakBoxContainsAudio = (trakBox) => {
    const stsd = (0, traversal_1.getStsdBox)(trakBox);
    if (!stsd) {
        return false;
    }
    const videoSample = stsd.samples.find((s) => s.type === 'audio');
    if (!videoSample || videoSample.type !== 'audio') {
        return false;
    }
    return true;
};
exports.trakBoxContainsAudio = trakBoxContainsAudio;
const trakBoxContainsVideo = (trakBox) => {
    const stsd = (0, traversal_1.getStsdBox)(trakBox);
    if (!stsd) {
        return false;
    }
    const videoSample = stsd.samples.find((s) => s.type === 'video');
    if (!videoSample || videoSample.type !== 'video') {
        return false;
    }
    return true;
};
exports.trakBoxContainsVideo = trakBoxContainsVideo;
const getTimescaleAndDuration = (trakBox) => {
    const mdhdBox = (0, traversal_1.getMdhdBox)(trakBox);
    if (mdhdBox) {
        return { timescale: mdhdBox.timescale, duration: mdhdBox.duration };
    }
    return null;
};
exports.getTimescaleAndDuration = getTimescaleAndDuration;
const getFpsFromMp4TrakBox = (trakBox) => {
    const timescaleAndDuration = (0, exports.getTimescaleAndDuration)(trakBox);
    if (!timescaleAndDuration) {
        return null;
    }
    const sttsBox = (0, traversal_1.getSttsBox)(trakBox);
    if (!sttsBox) {
        return null;
    }
    return calculateFps({
        sttsBox,
        timeScale: timescaleAndDuration.timescale,
        durationInSamples: timescaleAndDuration.duration,
    });
};
exports.getFpsFromMp4TrakBox = getFpsFromMp4TrakBox;
const getFpsFromIsoMaseMedia = (state) => {
    var _a, _b;
    const moovBox = (0, traversal_1.getMoovBoxFromState)({
        structureState: state.structure,
        isoState: state.iso,
        mp4HeaderSegment: (_b = (_a = state.m3uPlaylistContext) === null || _a === void 0 ? void 0 : _a.mp4HeaderSegment) !== null && _b !== void 0 ? _b : null,
        mayUsePrecomputed: true,
    });
    if (!moovBox) {
        return null;
    }
    const trackBoxes = (0, traversal_1.getTraks)(moovBox);
    const trackBox = trackBoxes.find(exports.trakBoxContainsVideo);
    if (!trackBox) {
        return null;
    }
    return (0, exports.getFpsFromMp4TrakBox)(trackBox);
};
const getFpsFromAvi = (structure) => {
    const strl = (0, traversal_2.getStrlBoxes)(structure);
    for (const s of strl) {
        const strh = (0, traversal_2.getStrhBox)(s.children);
        if (!strh) {
            throw new Error('No strh box');
        }
        if (strh.fccType === 'auds') {
            continue;
        }
        return strh.rate;
    }
    return null;
};
const getFps = (state) => {
    const segments = state.structure.getStructure();
    if (segments.type === 'iso-base-media') {
        return getFpsFromIsoMaseMedia(state);
    }
    if (segments.type === 'riff') {
        return getFpsFromAvi(segments);
    }
    // People need to get it from slowFps
    if (segments.type === 'matroska') {
        return null;
    }
    // People need to get it from slowFps
    if (segments.type === 'transport-stream') {
        return null;
    }
    // Same as m3u8
    if (segments.type === 'm3u') {
        return null;
    }
    if (segments.type === 'mp3' ||
        segments.type === 'wav' ||
        segments.type === 'flac' ||
        segments.type === 'aac') {
        return null;
    }
    throw new Error('Cannot get fps, not implemented: ' + segments);
};
exports.getFps = getFps;
const hasFpsSuitedForSlowFps = (state) => {
    try {
        return (0, exports.getFps)(state) !== null;
    }
    catch (_a) {
        return false;
    }
};
exports.hasFpsSuitedForSlowFps = hasFpsSuitedForSlowFps;
const hasFps = (state) => {
    // Matroska and Transport stream has no FPS metadata
    // Not bothering to parse
    // Users should use `slowFps` field
    // same goes for audio
    const structure = state.structure.getStructure();
    if ((0, is_audio_structure_1.isAudioStructure)(structure)) {
        return true;
    }
    if (structure.type === 'matroska') {
        return true;
    }
    if (structure.type === 'transport-stream') {
        return true;
    }
    if (structure.type === 'm3u') {
        return true;
    }
    return (0, exports.hasFpsSuitedForSlowFps)(state);
};
exports.hasFps = hasFps;
