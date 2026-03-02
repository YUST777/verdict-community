"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMovi = exports.handleChunk = void 0;
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const key_1 = require("../avc/key");
const parse_avc_1 = require("../avc/parse-avc");
const convert_queued_sample_to_mediaparser_sample_1 = require("./convert-queued-sample-to-mediaparser-sample");
const get_strh_for_index_1 = require("./get-strh-for-index");
const handleChunk = async ({ state, ckId, ckSize, }) => {
    var _a;
    const { iterator } = state;
    const offset = iterator.counter.getOffset() - 8;
    const videoChunk = ckId.match(/^([0-9]{2})dc$/);
    if (videoChunk) {
        const trackId = parseInt(videoChunk[1], 10);
        const strh = (0, get_strh_for_index_1.getStrhForIndex)(state.structure.getRiffStructure(), trackId);
        const samplesPerSecond = strh.rate / strh.scale;
        const data = iterator.getSlice(ckSize);
        const infos = (0, parse_avc_1.parseAvc)(data, state.avc);
        const keyOrDelta = (0, key_1.getKeyFrameOrDeltaFromAvcInfo)(infos);
        const info = infos.find((i) => i.type === 'keyframe' || i.type === 'delta-frame');
        const avcProfile = infos.find((i) => i.type === 'avc-profile');
        const ppsProfile = infos.find((i) => i.type === 'avc-pps');
        if (avcProfile && ppsProfile && !state.riff.getAvcProfile()) {
            await state.riff.onProfile({ pps: ppsProfile, sps: avcProfile });
            state.callbacks.tracks.setIsDone(state.logLevel);
        }
        const rawSample = {
            data,
            // We must also NOT pass a duration because if the the next sample is 0,
            // this sample would be longer. Chrome will pad it with silence.
            // If we'd pass a duration instead, it would shift the audio and we think that audio is not finished
            duration: 1 / samplesPerSecond,
            type: keyOrDelta === 'bidirectional' ? 'delta' : keyOrDelta,
            offset,
            avc: info,
        };
        const maxFramesInBuffer = state.avc.getMaxFramesInBuffer();
        if (maxFramesInBuffer === null) {
            throw new Error('maxFramesInBuffer is null');
        }
        if (((_a = info === null || info === void 0 ? void 0 : info.poc) !== null && _a !== void 0 ? _a : null) === null) {
            throw new Error('poc is null');
        }
        const keyframeOffset = state.riff.sampleCounter.getKeyframeAtOffset(rawSample);
        if (keyframeOffset !== null) {
            state.riff.sampleCounter.setPocAtKeyframeOffset({
                keyframeOffset,
                poc: info.poc,
            });
        }
        state.riff.queuedBFrames.addFrame({
            frame: rawSample,
            trackId,
            maxFramesInBuffer,
            timescale: samplesPerSecond,
        });
        const releasedFrame = state.riff.queuedBFrames.getReleasedFrame();
        if (!releasedFrame) {
            return;
        }
        const videoSample = (0, convert_queued_sample_to_mediaparser_sample_1.convertQueuedSampleToMediaParserSample)({
            sample: releasedFrame.sample,
            state,
            trackId: releasedFrame.trackId,
        });
        state.riff.sampleCounter.onVideoSample({
            trackId,
            videoSample,
        });
        await state.callbacks.onVideoSample({
            videoSample,
            trackId,
        });
    }
    const audioChunk = ckId.match(/^([0-9]{2})wb$/);
    if (audioChunk) {
        const trackId = parseInt(audioChunk[1], 10);
        const strh = (0, get_strh_for_index_1.getStrhForIndex)(state.structure.getRiffStructure(), trackId);
        const { strf } = strh;
        if (strf.type !== 'strf-box-audio') {
            throw new Error('audio');
        }
        const samplesPerSecond = (strh.rate / strh.scale) * strf.numberOfChannels;
        const nthSample = state.riff.sampleCounter.getSampleCountForTrack({
            trackId,
        });
        const timeInSec = nthSample / samplesPerSecond;
        const timestamp = Math.floor(timeInSec * webcodecs_timescale_1.WEBCODECS_TIMESCALE);
        const data = iterator.getSlice(ckSize);
        const audioSample = {
            decodingTimestamp: timestamp,
            data, // We must also NOT pass a duration because if the the next sample is 0,
            // this sample would be longer. Chrome will pad it with silence.
            // If we'd pass a duration instead, it would shift the audio and we think that audio is not finished
            duration: undefined,
            timestamp,
            type: 'key',
            offset,
        };
        state.riff.sampleCounter.onAudioSample(trackId, audioSample);
        // In example.avi, we have samples with 0 data
        // Chrome fails on these
        await state.callbacks.onAudioSample({
            audioSample,
            trackId,
        });
    }
};
exports.handleChunk = handleChunk;
const parseMovi = async ({ state, }) => {
    const { iterator } = state;
    if (iterator.bytesRemaining() < 8) {
        return Promise.resolve();
    }
    const checkpoint = iterator.startCheckpoint();
    const ckId = iterator.getByteString(4, false);
    const ckSize = iterator.getUint32Le();
    if (iterator.bytesRemaining() < ckSize) {
        checkpoint.returnToCheckpoint();
        return Promise.resolve();
    }
    await (0, exports.handleChunk)({ state, ckId, ckSize });
    const mediaSection = state.mediaSection.getMediaSectionAssertOnlyOne();
    const maxOffset = mediaSection.start + mediaSection.size;
    // Discard added zeroes
    while (iterator.counter.getOffset() < maxOffset &&
        iterator.bytesRemaining() > 0) {
        if (iterator.getUint8() !== 0) {
            iterator.counter.decrement(1);
            break;
        }
    }
};
exports.parseMovi = parseMovi;
