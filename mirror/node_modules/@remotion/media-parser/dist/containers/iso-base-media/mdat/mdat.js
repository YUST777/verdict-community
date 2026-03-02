"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMdatSection = void 0;
const convert_audio_or_video_sample_1 = require("../../../convert-audio-or-video-sample");
const get_tracks_1 = require("../../../get-tracks");
const log_1 = require("../../../log");
const skip_1 = require("../../../skip");
const cached_sample_positions_1 = require("../../../state/iso-base-media/cached-sample-positions");
const last_moof_box_1 = require("../../../state/iso-base-media/last-moof-box");
const may_skip_video_data_1 = require("../../../state/may-skip-video-data");
const video_section_1 = require("../../../state/video-section");
const webcodecs_timescale_1 = require("../../../webcodecs-timescale");
const get_moov_atom_1 = require("../get-moov-atom");
const postprocess_bytes_1 = require("./postprocess-bytes");
const parseMdatSection = async (state) => {
    const mediaSection = (0, video_section_1.getCurrentMediaSection)({
        offset: state.iterator.counter.getOffset(),
        mediaSections: state.mediaSection.getMediaSections(),
    });
    if (!mediaSection) {
        throw new Error('No video section defined');
    }
    const endOfMdat = mediaSection.size + mediaSection.start;
    // don't need mdat at all, can skip
    if ((0, may_skip_video_data_1.maySkipVideoData)({ state })) {
        const mfra = state.iso.mfra.getIfAlreadyLoaded();
        if (mfra) {
            const lastMoof = (0, last_moof_box_1.getLastMoofBox)(mfra);
            if (lastMoof && lastMoof > endOfMdat) {
                log_1.Log.verbose(state.logLevel, 'Skipping to last moof', lastMoof);
                return (0, skip_1.makeSkip)(lastMoof);
            }
        }
        return (0, skip_1.makeSkip)(endOfMdat);
    }
    // if we only need the first and last sample, we may skip over the samples in the middle
    // this logic skips the samples in the middle for a fragmented mp4
    if ((0, may_skip_video_data_1.maySkipOverSamplesInTheMiddle)({ state })) {
        const mfra = state.iso.mfra.getIfAlreadyLoaded();
        if (mfra) {
            const lastMoof = (0, last_moof_box_1.getLastMoofBox)(mfra);
            // we require that all moof boxes of both tracks have been processed, for correct duration calculation
            const firstMax = (0, last_moof_box_1.getMaxFirstMoofOffset)(mfra);
            const mediaSectionsBiggerThanMoof = state.mediaSection
                .getMediaSections()
                .filter((m) => m.start > firstMax).length;
            if (mediaSectionsBiggerThanMoof > 1 && lastMoof && lastMoof > endOfMdat) {
                log_1.Log.verbose(state.logLevel, 'Skipping to last moof because only first and last samples are needed');
                return (0, skip_1.makeSkip)(lastMoof);
            }
        }
    }
    const alreadyHasMoov = (0, get_tracks_1.getHasTracks)(state, true);
    if (!alreadyHasMoov) {
        const moov = await (0, get_moov_atom_1.getMoovAtom)({
            endOfMdat,
            state,
        });
        const tracksFromMoov = (0, get_tracks_1.getTracksFromMoovBox)(moov);
        state.iso.moov.setMoovBox({
            moovBox: moov,
            precomputed: false,
        });
        const existingTracks = state.callbacks.tracks.getTracks();
        for (const trackFromMoov of tracksFromMoov) {
            if (existingTracks.find((t) => t.trackId === trackFromMoov.trackId)) {
                continue;
            }
            if (trackFromMoov.type === 'other') {
                continue;
            }
            state.callbacks.tracks.addTrack(trackFromMoov);
        }
        state.callbacks.tracks.setIsDone(state.logLevel);
        state.structure.getIsoStructure().boxes.push(moov);
        return (0, exports.parseMdatSection)(state);
    }
    const tracks = state.callbacks.tracks.getTracks();
    if (!state.iso.flatSamples.getSamples(mediaSection.start)) {
        const samplePosition = (0, cached_sample_positions_1.calculateSamplePositions)({
            state,
            mediaSectionStart: mediaSection.start,
            trackIds: tracks.map((t) => t.trackId),
        });
        state.iso.flatSamples.setSamples(mediaSection.start, samplePosition);
    }
    const samplePositions = state.iso.flatSamples.getSamples(mediaSection.start);
    const sampleIndices = state.iso.flatSamples.getCurrentSampleIndices(mediaSection.start);
    const nextSampleArray = (0, cached_sample_positions_1.getSampleWithLowestDts)(samplePositions, sampleIndices);
    if (nextSampleArray.length === 0) {
        log_1.Log.verbose(state.logLevel, 'Iterated over all samples.', endOfMdat);
        return (0, skip_1.makeSkip)(endOfMdat);
    }
    const exactMatch = nextSampleArray.find((s) => s.samplePosition.offset === state.iterator.counter.getOffset());
    const nextSample = exactMatch !== null && exactMatch !== void 0 ? exactMatch : nextSampleArray.sort((a, b) => a.samplePosition.offset - b.samplePosition.offset)[0];
    if (nextSample.samplePosition.offset !== state.iterator.counter.getOffset()) {
        return (0, skip_1.makeSkip)(nextSample.samplePosition.offset);
    }
    // Corrupt file: Sample is beyond the end of the file. Don't process it.
    if (nextSample.samplePosition.offset + nextSample.samplePosition.size >
        state.contentLength) {
        log_1.Log.verbose(state.logLevel, "Sample is beyond the end of the file. Don't process it.", nextSample.samplePosition.offset + nextSample.samplePosition.size, endOfMdat);
        return (0, skip_1.makeSkip)(endOfMdat);
    }
    const { iterator } = state;
    // Need to fetch more data
    if (iterator.bytesRemaining() < nextSample.samplePosition.size) {
        return (0, skip_1.makeFetchMoreData)(nextSample.samplePosition.size - iterator.bytesRemaining());
    }
    const { timestamp: rawCts, decodingTimestamp: rawDts, duration, isKeyframe, offset, bigEndian, chunkSize, } = nextSample.samplePosition;
    const track = tracks.find((t) => t.trackId === nextSample.trackId);
    const { originalTimescale, startInSeconds, trackMediaTimeOffsetInTrackTimescale, timescale: trackTimescale, } = track;
    const cts = rawCts +
        startInSeconds * originalTimescale -
        (trackMediaTimeOffsetInTrackTimescale / trackTimescale) *
            webcodecs_timescale_1.WEBCODECS_TIMESCALE;
    const dts = rawDts +
        startInSeconds * originalTimescale -
        (trackMediaTimeOffsetInTrackTimescale / trackTimescale) *
            webcodecs_timescale_1.WEBCODECS_TIMESCALE;
    const bytes = (0, postprocess_bytes_1.postprocessBytes)({
        bytes: iterator.getSlice(nextSample.samplePosition.size),
        bigEndian,
        chunkSize,
    });
    if (track.type === 'audio') {
        const audioSample = (0, convert_audio_or_video_sample_1.convertAudioOrVideoSampleToWebCodecsTimestamps)({
            sample: {
                data: bytes,
                timestamp: cts,
                duration,
                decodingTimestamp: dts,
                type: isKeyframe ? 'key' : 'delta',
                offset,
            },
            timescale: originalTimescale,
        });
        await state.callbacks.onAudioSample({
            audioSample,
            trackId: track.trackId,
        });
    }
    if (track.type === 'video') {
        // https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/sei_checkpoint.mp4
        // Position in file 0x0001aba615
        // https://github.com/remotion-dev/remotion/issues/4680
        // In Chrome, we may not treat recovery points as keyframes
        // otherwise "a keyframe is required after flushing"
        const nalUnitType = bytes[4] & 0b00011111;
        let isRecoveryPoint = false;
        // SEI (Supplemental enhancement information)
        if (nalUnitType === 6) {
            const seiType = bytes[5];
            isRecoveryPoint = seiType === 6;
        }
        const videoSample = (0, convert_audio_or_video_sample_1.convertAudioOrVideoSampleToWebCodecsTimestamps)({
            sample: {
                data: bytes,
                timestamp: cts,
                duration,
                decodingTimestamp: dts,
                type: isKeyframe && !isRecoveryPoint ? 'key' : 'delta',
                offset,
            },
            timescale: originalTimescale,
        });
        await state.callbacks.onVideoSample({
            videoSample,
            trackId: track.trackId,
        });
    }
    state.iso.flatSamples.setCurrentSampleIndex(mediaSection.start, nextSample.trackId, nextSample.index + 1);
    return null;
};
exports.parseMdatSection = parseMdatSection;
