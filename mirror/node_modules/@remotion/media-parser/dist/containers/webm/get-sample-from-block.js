"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleFromBlock = void 0;
const buffer_iterator_1 = require("../../iterator/buffer-iterator");
const register_track_1 = require("../../register-track");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const parse_avc_1 = require("../avc/parse-avc");
const get_ready_tracks_1 = require("./get-ready-tracks");
const all_segments_1 = require("./segments/all-segments");
const block_simple_block_flags_1 = require("./segments/block-simple-block-flags");
const addAvcToTrackAndActivateTrackIfNecessary = async ({ partialVideoSample, codec, structureState, webmState, trackNumber, logLevel, callbacks, onVideoTrack, avcState, }) => {
    if (codec !== 'V_MPEG4/ISO/AVC') {
        return;
    }
    const missingTracks = (0, get_ready_tracks_1.getTracksFromMatroska)({
        structureState,
        webmState,
    }).missingInfo;
    if (missingTracks.length === 0) {
        return;
    }
    const parsed = (0, parse_avc_1.parseAvc)(partialVideoSample.data, avcState);
    for (const parse of parsed) {
        if (parse.type === 'avc-profile') {
            webmState.setAvcProfileForTrackNumber(trackNumber, parse);
            const track = missingTracks.find((t) => t.trackId === trackNumber);
            if (!track) {
                throw new Error('Could not find track ' + trackNumber);
            }
            const resolvedTracks = (0, get_ready_tracks_1.getTracksFromMatroska)({
                structureState,
                webmState,
            }).resolved;
            const resolvedTrack = resolvedTracks.find((t) => t.trackId === trackNumber);
            if (!resolvedTrack) {
                throw new Error('Could not find track ' + trackNumber);
            }
            await (0, register_track_1.registerVideoTrack)({
                track: resolvedTrack,
                container: 'webm',
                logLevel,
                onVideoTrack,
                registerVideoSampleCallback: callbacks.registerVideoSampleCallback,
                tracks: callbacks.tracks,
            });
        }
    }
};
const getSampleFromBlock = async ({ ebml, webmState, offset, structureState, callbacks, logLevel, onVideoTrack, avcState, }) => {
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: ebml.value,
        maxBytes: ebml.value.length,
        logLevel: 'error',
    });
    const trackNumber = iterator.getVint();
    if (trackNumber === null) {
        throw new Error('Not enough data to get track number, should not happen');
    }
    const timecodeRelativeToCluster = iterator.getInt16();
    const { keyframe } = (0, block_simple_block_flags_1.parseBlockFlags)(iterator, ebml.type === 'SimpleBlock'
        ? all_segments_1.matroskaElements.SimpleBlock
        : all_segments_1.matroskaElements.Block);
    const { codec, trackTimescale } = webmState.getTrackInfoByNumber(trackNumber);
    const clusterOffset = webmState.getTimestampOffsetForByteOffset(offset);
    const timescale = webmState.getTimescale();
    if (clusterOffset === undefined) {
        throw new Error('Could not find offset for byte offset ' + offset);
    }
    // https://github.com/hubblec4/Matroska-Chapters-Specs/blob/master/notes.md/#timestampscale
    // The TimestampScale Element is used to calculate the Raw Timestamp of a Block. The timestamp is obtained by adding the Block's timestamp to the Cluster's Timestamp Element, and then multiplying that result by the TimestampScale. The result will be the Block's Raw Timestamp in nanoseconds.
    const timecodeInNanoSeconds = (timecodeRelativeToCluster + clusterOffset) *
        timescale *
        (trackTimescale !== null && trackTimescale !== void 0 ? trackTimescale : 1);
    // Timecode should be in microseconds
    const timecodeInMicroseconds = timecodeInNanoSeconds / 1000;
    if (!codec) {
        throw new Error(`Could not find codec for track ${trackNumber}`);
    }
    const remainingNow = ebml.value.length - iterator.counter.getOffset();
    if (codec.startsWith('V_')) {
        const partialVideoSample = {
            data: iterator.getSlice(remainingNow),
            decodingTimestamp: timecodeInMicroseconds,
            duration: undefined,
            timestamp: timecodeInMicroseconds,
            offset,
        };
        if (keyframe === null) {
            iterator.destroy();
            return {
                type: 'partial-video-sample',
                partialVideoSample,
                trackId: trackNumber,
                timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            };
        }
        await addAvcToTrackAndActivateTrackIfNecessary({
            codec,
            partialVideoSample,
            structureState,
            webmState,
            trackNumber,
            callbacks,
            logLevel,
            onVideoTrack,
            avcState,
        });
        const sample = {
            ...partialVideoSample,
            type: keyframe ? 'key' : 'delta',
        };
        iterator.destroy();
        return {
            type: 'video-sample',
            videoSample: sample,
            trackId: trackNumber,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
        };
    }
    if (codec.startsWith('A_')) {
        const audioSample = {
            data: iterator.getSlice(remainingNow),
            timestamp: timecodeInMicroseconds,
            type: 'key',
            duration: undefined,
            decodingTimestamp: timecodeInMicroseconds,
            offset,
        };
        iterator.destroy();
        return {
            type: 'audio-sample',
            audioSample,
            trackId: trackNumber,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
        };
    }
    iterator.destroy();
    return {
        type: 'no-sample',
    };
};
exports.getSampleFromBlock = getSampleFromBlock;
