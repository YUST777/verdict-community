"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAllTracksFromAvi = exports.getTracksFromAvi = exports.makeAviVideoTrack = exports.makeAviAudioTrack = exports.getNumberOfTracks = exports.TO_BE_OVERRIDDEN_LATER = void 0;
const add_avc_profile_to_track_1 = require("../../add-avc-profile-to-track");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const timescale_1 = require("./timescale");
const traversal_1 = require("./traversal");
exports.TO_BE_OVERRIDDEN_LATER = 'to-be-overriden-later';
const getNumberOfTracks = (structure) => {
    const avihBox = (0, traversal_1.getAvihBox)(structure);
    if (avihBox) {
        return avihBox.streams;
    }
    throw new Error('No avih box found');
};
exports.getNumberOfTracks = getNumberOfTracks;
const makeAviAudioTrack = ({ strf, index, }) => {
    // 255 = AAC
    if (strf.formatTag !== 255) {
        throw new Error(`Unsupported audio format ${strf.formatTag}`);
    }
    return {
        type: 'audio',
        codec: 'mp4a.40.2', // According to Claude 3.5 Sonnet
        codecData: { type: 'aac-config', data: new Uint8Array([18, 16]) },
        codecEnum: 'aac',
        description: new Uint8Array([18, 16]),
        numberOfChannels: strf.numberOfChannels,
        sampleRate: strf.sampleRate,
        originalTimescale: timescale_1.MEDIA_PARSER_RIFF_TIMESCALE,
        trackId: index,
        startInSeconds: 0,
        timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
        trackMediaTimeOffsetInTrackTimescale: 0,
    };
};
exports.makeAviAudioTrack = makeAviAudioTrack;
const makeAviVideoTrack = ({ strh, strf, index, }) => {
    if (strh.handler !== 'H264') {
        throw new Error(`Unsupported video codec ${strh.handler}`);
    }
    return {
        codecData: null,
        codec: exports.TO_BE_OVERRIDDEN_LATER,
        codecEnum: 'h264',
        codedHeight: strf.height,
        codedWidth: strf.width,
        width: strf.width,
        height: strf.height,
        type: 'video',
        displayAspectHeight: strf.height,
        originalTimescale: timescale_1.MEDIA_PARSER_RIFF_TIMESCALE,
        description: undefined,
        m3uStreamFormat: null,
        trackId: index,
        colorSpace: {
            fullRange: null,
            matrix: null,
            primaries: null,
            transfer: null,
        },
        advancedColor: {
            fullRange: null,
            matrix: null,
            primaries: null,
            transfer: null,
        },
        displayAspectWidth: strf.width,
        rotation: 0,
        sampleAspectRatio: {
            numerator: 1,
            denominator: 1,
        },
        fps: strh.rate / strh.scale,
        startInSeconds: 0,
        timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
        trackMediaTimeOffsetInTrackTimescale: 0,
    };
};
exports.makeAviVideoTrack = makeAviVideoTrack;
const getTracksFromAvi = (structure, state) => {
    const tracks = [];
    const boxes = (0, traversal_1.getStrlBoxes)(structure);
    let i = 0;
    for (const box of boxes) {
        const strh = (0, traversal_1.getStrhBox)(box.children);
        if (!strh) {
            continue;
        }
        const { strf } = strh;
        if (strf.type === 'strf-box-video') {
            tracks.push((0, add_avc_profile_to_track_1.addAvcProfileToTrack)((0, exports.makeAviVideoTrack)({ strh, strf, index: i }), state.riff.getAvcProfile()));
        }
        else if (strh.fccType === 'auds') {
            tracks.push((0, exports.makeAviAudioTrack)({ strf, index: i }));
        }
        else {
            throw new Error(`Unsupported track type ${strh.fccType}`);
        }
        i++;
    }
    return tracks;
};
exports.getTracksFromAvi = getTracksFromAvi;
const hasAllTracksFromAvi = (state) => {
    try {
        const structure = state.structure.getRiffStructure();
        const numberOfTracks = (0, exports.getNumberOfTracks)(structure);
        const tracks = (0, exports.getTracksFromAvi)(structure, state);
        return (tracks.length === numberOfTracks &&
            !tracks.find((t) => t.type === 'video' && t.codec === exports.TO_BE_OVERRIDDEN_LATER));
    }
    catch (_a) {
        return false;
    }
};
exports.hasAllTracksFromAvi = hasAllTracksFromAvi;
