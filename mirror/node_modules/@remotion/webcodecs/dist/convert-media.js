"use strict";
/**
 * Copyright (c) 2025 Remotion AG
 * For licensing, see: https://remotion.dev/docs/webcodecs#license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMedia = void 0;
const media_parser_1 = require("@remotion/media-parser");
const web_1 = require("@remotion/media-parser/web");
const auto_select_writer_1 = require("./auto-select-writer");
const calculate_progress_1 = require("./calculate-progress");
const create_media_1 = require("./create-media");
const progress_tracker_1 = require("./create/progress-tracker");
const with_resolvers_1 = require("./create/with-resolvers");
const generate_output_filename_1 = require("./generate-output-filename");
const get_available_containers_1 = require("./get-available-containers");
const get_available_video_codecs_1 = require("./get-available-video-codecs");
const on_audio_track_1 = require("./on-audio-track");
const on_video_track_1 = require("./on-video-track");
const throttled_state_update_1 = require("./throttled-state-update");
const webcodecs_controller_1 = require("./webcodecs-controller");
const convertMedia = async function ({ src, onVideoFrame, onAudioData, onProgress: onProgressDoNotCallDirectly, audioCodec, container, videoCodec, controller = (0, webcodecs_controller_1.webcodecsController)(), onAudioTrack: userAudioResolver, onVideoTrack: userVideoResolver, reader, fields, logLevel = 'info', writer, progressIntervalInMs, rotate, resize, onAudioCodec, onContainer, onDimensions, onDurationInSeconds, onFps, onImages, onInternalStats, onIsHdr, onKeyframes, onLocation, onMetadata, onMimeType, onName, onNumberOfAudioChannels, onRotation, onSampleRate, onSize, onSlowAudioBitrate, onSlowDurationInSeconds, onSlowFps, onSlowKeyframes, onSlowNumberOfFrames, onSlowVideoBitrate, onSlowStructure, onTracks, onUnrotatedDimensions, onVideoCodec, onM3uStreams, selectM3uStream, selectM3uAssociatedPlaylists, expectedDurationInSeconds, expectedFrameRate, seekingHints, ...more }) {
    if (controller._internals._mediaParserController._internals.signal.aborted) {
        return Promise.reject(new media_parser_1.MediaParserAbortError('Aborted'));
    }
    if (get_available_containers_1.availableContainers.indexOf(container) === -1) {
        return Promise.reject(new TypeError(`Only the following values for "container" are supported currently: ${JSON.stringify(get_available_containers_1.availableContainers)}`));
    }
    if (videoCodec && get_available_video_codecs_1.availableVideoCodecs.indexOf(videoCodec) === -1) {
        return Promise.reject(new TypeError(`Only the following values for "videoCodec" are supported currently: ${JSON.stringify(get_available_video_codecs_1.availableVideoCodecs)}`));
    }
    const { resolve, reject, getPromiseToImmediatelyReturn } = (0, with_resolvers_1.withResolversAndWaitForReturn)();
    const abortConversion = (errCause) => {
        reject(errCause);
        if (!controller._internals._mediaParserController._internals.signal.aborted) {
            controller.abort();
        }
    };
    const onUserAbort = () => {
        abortConversion(new media_parser_1.MediaParserAbortError('Conversion aborted by user'));
    };
    controller._internals._mediaParserController._internals.signal.addEventListener('abort', onUserAbort);
    const throttledState = (0, throttled_state_update_1.throttledStateUpdate)({
        updateFn: onProgressDoNotCallDirectly ?? null,
        everyMilliseconds: progressIntervalInMs ?? 100,
        signal: controller._internals._mediaParserController._internals.signal,
    });
    const progressTracker = (0, progress_tracker_1.makeProgressTracker)();
    const state = await (0, create_media_1.createMedia)({
        container,
        filename: (0, generate_output_filename_1.generateOutputFilename)(src, container),
        writer: await (0, auto_select_writer_1.autoSelectWriter)(writer, logLevel),
        onBytesProgress: (bytesWritten) => {
            throttledState.update?.((prevState) => {
                return {
                    ...prevState,
                    bytesWritten,
                };
            });
        },
        onMillisecondsProgress: (millisecondsWritten) => {
            throttledState.update?.((prevState) => {
                if (millisecondsWritten > prevState.millisecondsWritten) {
                    return {
                        ...prevState,
                        millisecondsWritten,
                        overallProgress: (0, calculate_progress_1.calculateProgress)({
                            millisecondsWritten: prevState.millisecondsWritten,
                            expectedOutputDurationInMs: prevState.expectedOutputDurationInMs,
                        }),
                    };
                }
                return prevState;
            });
        },
        logLevel,
        progressTracker,
        expectedDurationInSeconds: expectedDurationInSeconds ?? null,
        expectedFrameRate: expectedFrameRate ?? null,
    });
    const onVideoTrack = (0, on_video_track_1.makeVideoTrackHandler)({
        progressTracker,
        state,
        onVideoFrame: onVideoFrame ?? null,
        onMediaStateUpdate: throttledState.update ?? null,
        abortConversion,
        controller,
        defaultVideoCodec: videoCodec ?? null,
        onVideoTrack: userVideoResolver ?? null,
        logLevel,
        outputContainer: container,
        rotate: rotate ?? 0,
        resizeOperation: resize ?? null,
    });
    const onAudioTrack = (0, on_audio_track_1.makeAudioTrackHandler)({
        progressTracker,
        abortConversion,
        defaultAudioCodec: audioCodec ?? null,
        controller,
        onMediaStateUpdate: throttledState.update ?? null,
        state,
        onAudioTrack: userAudioResolver ?? null,
        logLevel,
        outputContainer: container,
        onAudioData: onAudioData ?? null,
    });
    media_parser_1.MediaParserInternals.internalParseMedia({
        logLevel,
        src,
        onVideoTrack,
        onAudioTrack,
        controller: controller._internals._mediaParserController,
        fields: {
            ...fields,
            durationInSeconds: true,
        },
        reader: reader ?? web_1.webReader,
        ...more,
        onDurationInSeconds: (durationInSeconds) => {
            if (durationInSeconds === null) {
                return null;
            }
            const casted = more;
            if (casted.onDurationInSeconds) {
                casted.onDurationInSeconds(durationInSeconds);
            }
            const expectedOutputDurationInMs = durationInSeconds * 1000;
            throttledState.update?.((prevState) => {
                return {
                    ...prevState,
                    expectedOutputDurationInMs,
                    overallProgress: (0, calculate_progress_1.calculateProgress)({
                        millisecondsWritten: prevState.millisecondsWritten,
                        expectedOutputDurationInMs,
                    }),
                };
            });
        },
        acknowledgeRemotionLicense: true,
        mode: 'query',
        onDiscardedData: null,
        onError: () => ({ action: 'fail' }),
        onParseProgress: null,
        progressIntervalInMs: null,
        onAudioCodec: onAudioCodec ?? null,
        onContainer: onContainer ?? null,
        onDimensions: onDimensions ?? null,
        onFps: onFps ?? null,
        onImages: onImages ?? null,
        onInternalStats: onInternalStats ?? null,
        onIsHdr: onIsHdr ?? null,
        onKeyframes: onKeyframes ?? null,
        onLocation: onLocation ?? null,
        onMetadata: onMetadata ?? null,
        onMimeType: onMimeType ?? null,
        onName: onName ?? null,
        onNumberOfAudioChannels: onNumberOfAudioChannels ?? null,
        onRotation: onRotation ?? null,
        onSampleRate: onSampleRate ?? null,
        onSize: onSize ?? null,
        onSlowAudioBitrate: onSlowAudioBitrate ?? null,
        onSlowDurationInSeconds: onSlowDurationInSeconds ?? null,
        onSlowFps: onSlowFps ?? null,
        onSlowKeyframes: onSlowKeyframes ?? null,
        onSlowNumberOfFrames: onSlowNumberOfFrames ?? null,
        onSlowVideoBitrate: onSlowVideoBitrate ?? null,
        onSlowStructure: onSlowStructure ?? null,
        onTracks: onTracks ?? null,
        onUnrotatedDimensions: onUnrotatedDimensions ?? null,
        onVideoCodec: onVideoCodec ?? null,
        apiName: 'convertMedia()',
        onM3uStreams: onM3uStreams ?? null,
        selectM3uStream: selectM3uStream ?? media_parser_1.defaultSelectM3uStreamFn,
        selectM3uAssociatedPlaylists: selectM3uAssociatedPlaylists ?? media_parser_1.defaultSelectM3uAssociatedPlaylists,
        makeSamplesStartAtZero: false,
        m3uPlaylistContext: null,
        seekingHints: seekingHints ?? null,
    })
        .then(() => {
        return state.waitForFinish();
    })
        .then(() => {
        resolve({
            save: state.getBlob,
            remove: state.remove,
            finalState: throttledState.get(),
        });
    })
        .then(() => { })
        .catch((err) => {
        reject(err);
    })
        .finally(() => {
        throttledState.stopAndGetLastProgress();
    });
    return getPromiseToImmediatelyReturn().finally(() => {
        controller._internals._mediaParserController._internals.signal.removeEventListener('abort', onUserAbort);
    });
};
exports.convertMedia = convertMedia;
