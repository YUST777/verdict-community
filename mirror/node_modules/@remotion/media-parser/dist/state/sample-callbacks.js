"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbacksState = void 0;
const log_1 = require("../log");
const webcodecs_timescale_1 = require("../webcodecs-timescale");
const can_skip_tracks_1 = require("./can-skip-tracks");
const has_tracks_section_1 = require("./has-tracks-section");
const need_samples_for_fields_1 = require("./need-samples-for-fields");
const callbacksState = ({ controller, hasAudioTrackHandlers, hasVideoTrackHandlers, fields, keyframes, emittedFields, samplesObserved, structure, src, seekSignal, logLevel, }) => {
    const videoSampleCallbacks = {};
    const audioSampleCallbacks = {};
    const onTrackDoneCallback = {};
    const queuedAudioSamples = {};
    const queuedVideoSamples = {};
    const canSkipTracksState = (0, can_skip_tracks_1.makeCanSkipTracksState)({
        hasAudioTrackHandlers,
        fields,
        hasVideoTrackHandlers,
        structure,
    });
    const tracksState = (0, has_tracks_section_1.makeTracksSectionState)(canSkipTracksState, src);
    return {
        registerVideoSampleCallback: async (id, callback) => {
            var _a;
            if (callback === null) {
                delete videoSampleCallbacks[id];
                return;
            }
            videoSampleCallbacks[id] = callback;
            for (const queued of (_a = queuedVideoSamples[id]) !== null && _a !== void 0 ? _a : []) {
                await callback(queued);
            }
            queuedVideoSamples[id] = [];
        },
        onAudioSample: async ({ audioSample, trackId, }) => {
            if (controller._internals.signal.aborted) {
                throw new Error('Aborted');
            }
            const callback = audioSampleCallbacks[trackId];
            if (audioSample.data.length > 0) {
                // If we emit samples with data length 0, Chrome will fail
                if (callback) {
                    if (seekSignal.getSeek() !== null) {
                        log_1.Log.trace(logLevel, 'Not emitting sample because seek is processing');
                    }
                    else {
                        const trackDoneCallback = await callback(audioSample);
                        onTrackDoneCallback[trackId] = trackDoneCallback !== null && trackDoneCallback !== void 0 ? trackDoneCallback : null;
                    }
                }
            }
            if ((0, need_samples_for_fields_1.needsToIterateOverSamples)({ emittedFields, fields })) {
                samplesObserved.addAudioSample(audioSample);
            }
        },
        onVideoSample: async ({ trackId, videoSample, }) => {
            if (controller._internals.signal.aborted) {
                throw new Error('Aborted');
            }
            if (videoSample.data.length > 0) {
                const callback = videoSampleCallbacks[trackId];
                // If we emit samples with data 0, Chrome will fail
                if (callback) {
                    if (seekSignal.getSeek() !== null) {
                        log_1.Log.trace(logLevel, 'Not emitting sample because seek is processing');
                    }
                    else {
                        const trackDoneCallback = await callback(videoSample);
                        onTrackDoneCallback[trackId] = trackDoneCallback !== null && trackDoneCallback !== void 0 ? trackDoneCallback : null;
                    }
                }
            }
            if (videoSample.type === 'key') {
                keyframes.addKeyframe({
                    trackId,
                    decodingTimeInSeconds: videoSample.decodingTimestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE,
                    positionInBytes: videoSample.offset,
                    presentationTimeInSeconds: videoSample.timestamp / webcodecs_timescale_1.WEBCODECS_TIMESCALE,
                    sizeInBytes: videoSample.data.length,
                });
            }
            if ((0, need_samples_for_fields_1.needsToIterateOverSamples)({
                fields,
                emittedFields,
            })) {
                samplesObserved.addVideoSample(videoSample);
            }
        },
        canSkipTracksState,
        registerAudioSampleCallback: async (id, callback) => {
            var _a;
            if (callback === null) {
                delete audioSampleCallbacks[id];
                return;
            }
            audioSampleCallbacks[id] = callback;
            for (const queued of (_a = queuedAudioSamples[id]) !== null && _a !== void 0 ? _a : []) {
                await callback(queued);
            }
            queuedAudioSamples[id] = [];
        },
        tracks: tracksState,
        audioSampleCallbacks,
        videoSampleCallbacks,
        hasAudioTrackHandlers,
        hasVideoTrackHandlers,
        callTracksDoneCallback: async () => {
            for (const callback of Object.values(onTrackDoneCallback)) {
                if (callback) {
                    await callback();
                }
            }
        },
    };
};
exports.callbacksState = callbacksState;
