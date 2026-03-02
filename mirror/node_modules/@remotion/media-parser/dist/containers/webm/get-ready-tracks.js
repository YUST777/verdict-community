"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matroskaHasTracks = exports.getTracksFromMatroska = void 0;
const codec_string_1 = require("../avc/codec-string");
const make_track_1 = require("./make-track");
const traversal_1 = require("./traversal");
const getTracksFromMatroska = ({ structureState, webmState, }) => {
    const structure = structureState.getMatroskaStructure();
    const mainSegment = (0, traversal_1.getMainSegment)(structure.boxes);
    if (!mainSegment) {
        throw new Error('No main segment');
    }
    const tracksSegment = (0, traversal_1.getTracksSegment)(mainSegment);
    if (!tracksSegment) {
        throw new Error('No tracks segment');
    }
    const resolvedTracks = [];
    const missingInfo = [];
    for (const trackEntrySegment of tracksSegment.value) {
        if (trackEntrySegment.type === 'Crc32') {
            continue;
        }
        if (trackEntrySegment.type !== 'TrackEntry') {
            throw new Error('Expected track entry segment');
        }
        const track = (0, make_track_1.getTrack)({
            track: trackEntrySegment,
            timescale: webmState.getTimescale(),
        });
        if (!track) {
            continue;
        }
        if (track.codec === make_track_1.NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS) {
            const avc = webmState.getAvcProfileForTrackNumber(track.trackId);
            if (avc) {
                resolvedTracks.push({
                    ...track,
                    codec: (0, codec_string_1.getCodecStringFromSpsAndPps)(avc),
                });
            }
            else {
                missingInfo.push(track);
            }
        }
        else {
            resolvedTracks.push(track);
        }
    }
    return { missingInfo, resolved: resolvedTracks };
};
exports.getTracksFromMatroska = getTracksFromMatroska;
const matroskaHasTracks = ({ structureState, webmState, }) => {
    const structure = structureState.getMatroskaStructure();
    const mainSegment = (0, traversal_1.getMainSegment)(structure.boxes);
    if (!mainSegment) {
        return false;
    }
    return ((0, traversal_1.getTracksSegment)(mainSegment) !== null &&
        (0, exports.getTracksFromMatroska)({
            structureState,
            webmState,
        }).missingInfo.length === 0);
};
exports.matroskaHasTracks = matroskaHasTracks;
