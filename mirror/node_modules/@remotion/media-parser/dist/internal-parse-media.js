"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalParseMedia = void 0;
const media_parser_controller_1 = require("./controller/media-parser-controller");
const emit_all_info_1 = require("./emit-all-info");
const get_seeking_hints_1 = require("./get-seeking-hints");
const log_1 = require("./log");
const parse_loop_1 = require("./parse-loop");
const print_timings_1 = require("./print-timings");
const remotion_license_acknowledge_1 = require("./remotion-license-acknowledge");
const set_seeking_hints_1 = require("./set-seeking-hints");
const parser_state_1 = require("./state/parser-state");
const throttled_progress_1 = require("./throttled-progress");
const work_on_seek_request_1 = require("./work-on-seek-request");
const internalParseMedia = async function ({ src, fields: _fieldsInReturnValue, reader: readerInterface, onAudioTrack, onVideoTrack, controller = (0, media_parser_controller_1.mediaParserController)(), logLevel, onParseProgress: onParseProgressDoNotCallDirectly, progressIntervalInMs, mode, onDiscardedData, onError, acknowledgeRemotionLicense, apiName, selectM3uStream: selectM3uStreamFn, selectM3uAssociatedPlaylists: selectM3uAssociatedPlaylistsFn, m3uPlaylistContext, makeSamplesStartAtZero, seekingHints, ...more }) {
    var _a;
    if (!src) {
        throw new Error('No "src" provided');
    }
    controller._internals.markAsReadyToEmitEvents();
    (0, remotion_license_acknowledge_1.warnIfRemotionLicenseNotAcknowledged)({
        acknowledgeRemotionLicense,
        logLevel,
        apiName,
    });
    log_1.Log.verbose(logLevel, `Reading ${typeof src === 'string' ? src : src instanceof URL ? src.toString() : src instanceof File ? src.name : src.toString()}`);
    const prefetchCache = new Map();
    const { reader: readerInstance, contentLength, name, contentType, supportsContentRange, needsContentRange, } = await readerInterface.read({
        src,
        range: null,
        controller,
        logLevel,
        prefetchCache,
    });
    if (contentLength === null) {
        throw new Error(`Cannot read media ${src} without a content length. This is currently not supported. Ensure the media has a "Content-Length" HTTP header.`);
    }
    if (!supportsContentRange && needsContentRange) {
        throw new Error('Cannot read media without it supporting the "Content-Range" header. This is currently not supported. Ensure the media supports the "Content-Range" HTTP header.');
    }
    const hasAudioTrackHandlers = Boolean(onAudioTrack);
    const hasVideoTrackHandlers = Boolean(onVideoTrack);
    const state = (0, parser_state_1.makeParserState)({
        hasAudioTrackHandlers,
        hasVideoTrackHandlers,
        controller,
        onAudioTrack: onAudioTrack !== null && onAudioTrack !== void 0 ? onAudioTrack : null,
        onVideoTrack: onVideoTrack !== null && onVideoTrack !== void 0 ? onVideoTrack : null,
        contentLength,
        logLevel,
        mode,
        readerInterface,
        src,
        onDiscardedData,
        selectM3uStreamFn,
        selectM3uAssociatedPlaylistsFn,
        m3uPlaylistContext,
        contentType,
        name,
        callbacks: more,
        fieldsInReturnValue: _fieldsInReturnValue !== null && _fieldsInReturnValue !== void 0 ? _fieldsInReturnValue : {},
        mimeType: contentType,
        initialReaderInstance: readerInstance,
        makeSamplesStartAtZero,
        prefetchCache,
    });
    if (seekingHints) {
        (0, set_seeking_hints_1.setSeekingHints)({ hints: seekingHints, state });
    }
    controller._internals.attachSeekingHintResolution(() => Promise.resolve((0, get_seeking_hints_1.getSeekingHints)({
        tracksState: state.callbacks.tracks,
        keyframesState: state.keyframes,
        webmState: state.webm,
        structureState: state.structure,
        m3uPlaylistContext: state.m3uPlaylistContext,
        mediaSectionState: state.mediaSection,
        isoState: state.iso,
        transportStream: state.transportStream,
        flacState: state.flac,
        samplesObserved: state.samplesObserved,
        riffState: state.riff,
        mp3State: state.mp3,
        contentLength: state.contentLength,
        aacState: state.aac,
    })));
    controller._internals.attachSimulateSeekResolution((seek) => {
        const { aacState, avcState, flacState, isoState, iterator, keyframes, m3uState, mediaSection, mp3State, riffState, samplesObserved, structureState, tracksState, transportStream, webmState, } = (0, work_on_seek_request_1.getWorkOnSeekRequestOptions)(state);
        return (0, work_on_seek_request_1.turnSeekIntoByte)({
            aacState,
            seek,
            avcState,
            contentLength,
            flacState,
            isoState,
            iterator,
            keyframes,
            logLevel,
            m3uPlaylistContext,
            m3uState,
            mediaSectionState: mediaSection,
            mp3State,
            riffState,
            samplesObserved,
            structureState,
            tracksState,
            transportStream,
            webmState,
        });
    });
    if (!hasAudioTrackHandlers &&
        !hasVideoTrackHandlers &&
        Object.values(state.fields).every((v) => !v) &&
        mode === 'query') {
        log_1.Log.warn(logLevel, new Error('Warning - No `fields` and no `on*` callbacks were passed to `parseMedia()`. Specify the data you would like to retrieve.'));
    }
    const throttledState = (0, throttled_progress_1.throttledStateUpdate)({
        updateFn: onParseProgressDoNotCallDirectly !== null && onParseProgressDoNotCallDirectly !== void 0 ? onParseProgressDoNotCallDirectly : null,
        everyMilliseconds: progressIntervalInMs !== null && progressIntervalInMs !== void 0 ? progressIntervalInMs : 100,
        controller,
        totalBytes: contentLength,
    });
    await (0, emit_all_info_1.triggerInfoEmit)(state);
    await (0, parse_loop_1.parseLoop)({ state, throttledState, onError });
    log_1.Log.verbose(logLevel, 'Finished parsing file');
    await (0, emit_all_info_1.emitAllInfo)(state);
    (0, print_timings_1.printTimings)(state);
    state.currentReader.getCurrent().abort();
    (_a = state.iterator) === null || _a === void 0 ? void 0 : _a.destroy();
    state.callbacks.tracks.ensureHasTracksAtEnd(state.fields);
    state.m3u.abortM3UStreamRuns();
    prefetchCache.clear();
    if (state.errored) {
        throw state.errored;
    }
    if (state.controller._internals.seekSignal.getSeek() !== null) {
        throw new Error('Should not finish while a seek is pending');
    }
    return state.returnValue;
};
exports.internalParseMedia = internalParseMedia;
