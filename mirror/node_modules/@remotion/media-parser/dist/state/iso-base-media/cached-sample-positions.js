"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleWithLowestDts = exports.cachedSamplePositionsState = exports.calculateSamplePositions = void 0;
const are_samples_complete_1 = require("../../containers/iso-base-media/are-samples-complete");
const get_sample_positions_from_track_1 = require("../../containers/iso-base-media/get-sample-positions-from-track");
const traversal_1 = require("../../containers/iso-base-media/traversal");
const get_tracks_1 = require("../../get-tracks");
const log_1 = require("../../log");
const precomputed_tfra_1 = require("./precomputed-tfra");
const calculateSamplePositions = ({ state, mediaSectionStart, trackIds, }) => {
    var _a, _b;
    const tracks = (0, get_tracks_1.getTracks)(state, true);
    const moofBoxes = (0, traversal_1.getMoofBoxes)(state.structure.getIsoStructure().boxes);
    const tfraBoxes = (0, precomputed_tfra_1.deduplicateTfraBoxesByOffset)([
        ...state.iso.tfra.getTfraBoxes(),
        ...(0, traversal_1.getTfraBoxes)(state.structure.getIsoStructure().boxes),
    ]);
    const moofComplete = (0, are_samples_complete_1.areSamplesComplete)({ moofBoxes, tfraBoxes });
    const relevantMoofBox = moofBoxes.find((moofBox) => moofBox.offset + moofBox.size + 8 === mediaSectionStart);
    if (moofBoxes.length > 0 && !relevantMoofBox) {
        throw new Error('No relevant moof box found');
    }
    const moov = (0, traversal_1.getMoovBoxFromState)({
        structureState: state.structure,
        isoState: state.iso,
        mp4HeaderSegment: (_b = (_a = state.m3uPlaylistContext) === null || _a === void 0 ? void 0 : _a.mp4HeaderSegment) !== null && _b !== void 0 ? _b : null,
        mayUsePrecomputed: true,
    });
    if (!moov) {
        throw new Error('No moov box found');
    }
    const trackIdAndSamplePositions = [];
    for (const track of tracks) {
        const trakBox = (0, traversal_1.getTrakBoxByTrackId)(moov, track.trackId);
        if (!trackIds.includes(track.trackId)) {
            log_1.Log.verbose(state.logLevel, 'Skipping calculating sample positions for track', track.trackId);
            continue;
        }
        if (!trakBox) {
            throw new Error('No trak box found');
        }
        const { samplePositions } = (0, get_sample_positions_from_track_1.getSamplePositionsFromTrack)({
            trakBox,
            moofBoxes: relevantMoofBox ? [relevantMoofBox] : [],
            moofComplete,
            trexBoxes: (0, traversal_1.getTrexBoxes)(moov),
        });
        trackIdAndSamplePositions.push({
            trackId: track.trackId,
            samplePositions,
        });
    }
    return trackIdAndSamplePositions;
};
exports.calculateSamplePositions = calculateSamplePositions;
const updateSampleIndicesAfterSeek = ({ samplePositionsForMdatStart, seekedByte, }) => {
    const currentSampleIndices = {};
    const keys = Object.keys(samplePositionsForMdatStart).map(Number).sort();
    const mdat = keys.find((key) => seekedByte >= key);
    if (!mdat) {
        return currentSampleIndices;
    }
    const samplePositions = samplePositionsForMdatStart[mdat];
    if (!samplePositions) {
        return currentSampleIndices;
    }
    for (const track of samplePositions) {
        const currentSampleIndex = track.samplePositions.findIndex((sample) => sample.offset >= seekedByte);
        if (!currentSampleIndices[mdat]) {
            currentSampleIndices[mdat] = {};
        }
        if (!currentSampleIndices[mdat][track.trackId]) {
            currentSampleIndices[mdat][track.trackId] = 0;
        }
        if (currentSampleIndex === -1) {
            currentSampleIndices[mdat][track.trackId] = track.samplePositions.length;
        }
        else {
            currentSampleIndices[mdat][track.trackId] = currentSampleIndex;
        }
    }
    return currentSampleIndices;
};
const cachedSamplePositionsState = () => {
    // offset -> sample positions
    const samplePositionsForMdatStart = {};
    let currentSampleIndex = {};
    return {
        getSamples: (mdatStart) => {
            var _a;
            return (_a = samplePositionsForMdatStart[mdatStart]) !== null && _a !== void 0 ? _a : null;
        },
        setSamples: (mdatStart, samples) => {
            samplePositionsForMdatStart[mdatStart] = samples;
        },
        setCurrentSampleIndex: (mdatStart, trackId, index) => {
            if (!currentSampleIndex[mdatStart]) {
                currentSampleIndex[mdatStart] = {};
            }
            if (!currentSampleIndex[mdatStart][trackId]) {
                currentSampleIndex[mdatStart][trackId] = 0;
            }
            currentSampleIndex[mdatStart][trackId] = index;
        },
        getCurrentSampleIndices: (mdatStart) => {
            var _a;
            return (_a = currentSampleIndex[mdatStart]) !== null && _a !== void 0 ? _a : {};
        },
        updateAfterSeek: (seekedByte) => {
            currentSampleIndex = updateSampleIndicesAfterSeek({
                samplePositionsForMdatStart,
                seekedByte,
            });
        },
    };
};
exports.cachedSamplePositionsState = cachedSamplePositionsState;
const getSampleWithLowestDts = (samplePositions, currentSampleIndexMap) => {
    var _a;
    const lowestDts = [];
    for (const track of samplePositions) {
        const currentSampleIndex = (_a = currentSampleIndexMap[track.trackId]) !== null && _a !== void 0 ? _a : 0;
        const currentSample = track.samplePositions[currentSampleIndex];
        if (currentSample &&
            (lowestDts.length === 0 ||
                currentSample.decodingTimestamp <=
                    lowestDts[0].samplePosition.decodingTimestamp)) {
            lowestDts.push({
                samplePosition: currentSample,
                trackId: track.trackId,
                index: currentSampleIndex,
            });
        }
    }
    return lowestDts;
};
exports.getSampleWithLowestDts = getSampleWithLowestDts;
