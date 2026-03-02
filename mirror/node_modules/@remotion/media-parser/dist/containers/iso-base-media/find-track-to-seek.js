"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTrackToSeek = exports.findAnyTrackWithSamplePositions = void 0;
const are_samples_complete_1 = require("./are-samples-complete");
const get_sample_positions_from_track_1 = require("./get-sample-positions-from-track");
const traversal_1 = require("./traversal");
const findAnyTrackWithSamplePositions = (allTracks, struc) => {
    const moov = (0, traversal_1.getMoovFromFromIsoStructure)(struc);
    if (!moov) {
        return null;
    }
    for (const track of allTracks) {
        if (track.type === 'video' || track.type === 'audio') {
            const trakBox = (0, traversal_1.getTrakBoxByTrackId)(moov, track.trackId);
            if (!trakBox) {
                continue;
            }
            const { samplePositions } = (0, get_sample_positions_from_track_1.getSamplePositionsFromTrack)({
                trakBox,
                moofBoxes: (0, traversal_1.getMoofBoxes)(struc.boxes),
                moofComplete: (0, are_samples_complete_1.areSamplesComplete)({
                    moofBoxes: (0, traversal_1.getMoofBoxes)(struc.boxes),
                    tfraBoxes: (0, traversal_1.getTfraBoxes)(struc.boxes),
                }),
                trexBoxes: (0, traversal_1.getTrexBoxes)(moov),
            });
            if (samplePositions.length === 0) {
                continue;
            }
            return { track, samplePositions };
        }
    }
    return null;
};
exports.findAnyTrackWithSamplePositions = findAnyTrackWithSamplePositions;
const findTrackToSeek = (allTracks, structure) => {
    const firstVideoTrack = allTracks.find((t) => t.type === 'video');
    const struc = structure.getIsoStructure();
    if (!firstVideoTrack) {
        return (0, exports.findAnyTrackWithSamplePositions)(allTracks, struc);
    }
    const moov = (0, traversal_1.getMoovFromFromIsoStructure)(struc);
    if (!moov) {
        return null;
    }
    const trakBox = (0, traversal_1.getTrakBoxByTrackId)(moov, firstVideoTrack.trackId);
    if (!trakBox) {
        return null;
    }
    const { samplePositions } = (0, get_sample_positions_from_track_1.getSamplePositionsFromTrack)({
        trakBox,
        moofBoxes: (0, traversal_1.getMoofBoxes)(struc.boxes),
        moofComplete: (0, are_samples_complete_1.areSamplesComplete)({
            moofBoxes: (0, traversal_1.getMoofBoxes)(struc.boxes),
            tfraBoxes: (0, traversal_1.getTfraBoxes)(struc.boxes),
        }),
        trexBoxes: (0, traversal_1.getTrexBoxes)(moov),
    });
    if (samplePositions.length === 0) {
        return (0, exports.findAnyTrackWithSamplePositions)(allTracks, struc);
    }
    return { track: firstVideoTrack, samplePositions };
};
exports.findTrackToSeek = findTrackToSeek;
