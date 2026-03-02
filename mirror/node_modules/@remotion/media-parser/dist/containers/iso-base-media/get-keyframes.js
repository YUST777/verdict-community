"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyframesFromIsoBaseMedia = void 0;
const get_tracks_1 = require("../../get-tracks");
const are_samples_complete_1 = require("./are-samples-complete");
const get_sample_positions_from_track_1 = require("./get-sample-positions-from-track");
const traversal_1 = require("./traversal");
const getKeyframesFromIsoBaseMedia = (state) => {
    const tracks = (0, get_tracks_1.getTracksFromIsoBaseMedia)({
        isoState: state.iso,
        m3uPlaylistContext: state.m3uPlaylistContext,
        structure: state.structure,
        mayUsePrecomputed: true,
    });
    const videoTracks = tracks.filter((t) => t.type === 'video');
    const structure = state.structure.getIsoStructure();
    const moofBoxes = (0, traversal_1.getMoofBoxes)(structure.boxes);
    const tfraBoxes = (0, traversal_1.getTfraBoxes)(structure.boxes);
    const moov = (0, traversal_1.getMoovFromFromIsoStructure)(structure);
    if (!moov) {
        return [];
    }
    const allSamples = videoTracks.map((t) => {
        const { originalTimescale: ts } = t;
        const trakBox = (0, traversal_1.getTrakBoxByTrackId)(moov, t.trackId);
        if (!trakBox) {
            return [];
        }
        const { samplePositions, isComplete } = (0, get_sample_positions_from_track_1.getSamplePositionsFromTrack)({
            trakBox,
            moofBoxes,
            moofComplete: (0, are_samples_complete_1.areSamplesComplete)({
                moofBoxes,
                tfraBoxes,
            }),
            trexBoxes: (0, traversal_1.getTrexBoxes)(moov),
        });
        if (!isComplete) {
            return [];
        }
        const keyframes = samplePositions
            .filter((k) => {
            return k.isKeyframe;
        })
            .map((k) => {
            return {
                trackId: t.trackId,
                presentationTimeInSeconds: k.timestamp / ts,
                decodingTimeInSeconds: k.decodingTimestamp / ts,
                positionInBytes: k.offset,
                sizeInBytes: k.size,
            };
        });
        return keyframes;
    });
    return allSamples.flat();
};
exports.getKeyframesFromIsoBaseMedia = getKeyframesFromIsoBaseMedia;
