"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.m3uHasStreams = exports.getM3uStreams = exports.isIndependentSegments = void 0;
const isIndependentSegments = (structure) => {
    if (structure === null || structure.type !== 'm3u') {
        return false;
    }
    return structure.boxes.some((box) => box.type === 'm3u-independent-segments' || box.type === 'm3u-stream-info');
};
exports.isIndependentSegments = isIndependentSegments;
const getM3uStreams = ({ structure, originalSrc, readerInterface, }) => {
    if (structure === null || structure.type !== 'm3u') {
        return null;
    }
    const boxes = [];
    for (let i = 0; i < structure.boxes.length; i++) {
        const str = structure.boxes[i];
        if (str.type === 'm3u-stream-info') {
            const next = structure.boxes[i + 1];
            if (next.type !== 'm3u-text-value') {
                throw new Error('Expected m3u-text-value');
            }
            const associatedPlaylists = [];
            if (str.audio) {
                const match = structure.boxes.filter((box) => {
                    return box.type === 'm3u-media-info' && box.groupId === str.audio;
                });
                for (const audioTrack of match) {
                    associatedPlaylists.push({
                        autoselect: audioTrack.autoselect,
                        channels: audioTrack.channels,
                        default: audioTrack.default,
                        groupId: audioTrack.groupId,
                        language: audioTrack.language,
                        name: audioTrack.name,
                        src: readerInterface.createAdjacentFileSource(audioTrack.uri, originalSrc),
                        id: associatedPlaylists.length,
                        isAudio: true,
                    });
                }
            }
            boxes.push({
                src: readerInterface.createAdjacentFileSource(next.value, originalSrc),
                averageBandwidthInBitsPerSec: str.averageBandwidthInBitsPerSec,
                bandwidthInBitsPerSec: str.bandwidthInBitsPerSec,
                codecs: str.codecs,
                dimensions: str.dimensions,
                associatedPlaylists,
            });
        }
    }
    // Maybe this is already a playlist
    if (boxes.length === 0) {
        return null;
    }
    const sorted = boxes.slice().sort((a, b) => {
        var _a, _b, _c, _d;
        const aResolution = a.dimensions
            ? a.dimensions.width * a.dimensions.height
            : 0;
        const bResolution = b.dimensions
            ? b.dimensions.width * b.dimensions.height
            : 0;
        if (aResolution === bResolution) {
            const bandwidthA = (_b = (_a = a.averageBandwidthInBitsPerSec) !== null && _a !== void 0 ? _a : a.bandwidthInBitsPerSec) !== null && _b !== void 0 ? _b : 0;
            const bandwidthB = (_d = (_c = b.averageBandwidthInBitsPerSec) !== null && _c !== void 0 ? _c : b.bandwidthInBitsPerSec) !== null && _d !== void 0 ? _d : 0;
            return bandwidthB - bandwidthA;
        }
        return bResolution - aResolution;
    });
    return sorted.map((box, index) => ({ ...box, id: index }));
};
exports.getM3uStreams = getM3uStreams;
const m3uHasStreams = (state) => {
    const structure = state.structure.getStructureOrNull();
    if (!structure) {
        return false;
    }
    if (structure.type !== 'm3u') {
        return true;
    }
    return state.m3u.hasFinishedManifest();
};
exports.m3uHasStreams = m3uHasStreams;
