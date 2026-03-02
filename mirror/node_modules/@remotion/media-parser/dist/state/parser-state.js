"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeParserState = void 0;
const get_fields_from_callbacks_1 = require("../get-fields-from-callbacks");
const buffer_iterator_1 = require("../iterator/buffer-iterator");
const log_1 = require("../log");
const aac_state_1 = require("./aac-state");
const avc_state_1 = require("./avc/avc-state");
const current_reader_1 = require("./current-reader");
const emitted_fields_1 = require("./emitted-fields");
const flac_state_1 = require("./flac-state");
const images_1 = require("./images");
const iso_state_1 = require("./iso-base-media/iso-state");
const keyframes_1 = require("./keyframes");
const m3u_state_1 = require("./m3u-state");
const webm_1 = require("./matroska/webm");
const mp3_1 = require("./mp3");
const riff_1 = require("./riff");
const sample_callbacks_1 = require("./sample-callbacks");
const slow_duration_fps_1 = require("./samples-observed/slow-duration-fps");
const seek_infinite_loop_1 = require("./seek-infinite-loop");
const structure_1 = require("./structure");
const timings_1 = require("./timings");
const transport_stream_1 = require("./transport-stream/transport-stream");
const video_section_1 = require("./video-section");
const makeParserState = ({ hasAudioTrackHandlers, hasVideoTrackHandlers, controller, onAudioTrack, onVideoTrack, contentLength, logLevel, mode, src, readerInterface, onDiscardedData, selectM3uStreamFn, selectM3uAssociatedPlaylistsFn, m3uPlaylistContext, contentType, name, callbacks, fieldsInReturnValue, mimeType, initialReaderInstance, makeSamplesStartAtZero, prefetchCache, }) => {
    let skippedBytes = 0;
    const returnValue = {};
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: new Uint8Array([]),
        maxBytes: contentLength,
        logLevel,
    });
    const increaseSkippedBytes = (bytes) => {
        skippedBytes += bytes;
    };
    const structure = (0, structure_1.structureState)();
    const keyframes = (0, keyframes_1.keyframesState)();
    const emittedFields = (0, emitted_fields_1.emittedState)();
    const samplesObserved = (0, slow_duration_fps_1.samplesObservedState)();
    const mp3 = (0, mp3_1.makeMp3State)();
    const images = (0, images_1.imagesState)();
    const timings = (0, timings_1.timingsState)();
    const seekInfiniteLoop = (0, seek_infinite_loop_1.seekInfiniteLoopDetectionState)();
    const currentReaderState = (0, current_reader_1.currentReader)(initialReaderInstance);
    const avc = (0, avc_state_1.avcState)();
    const errored = null;
    const discardReadBytes = async (force) => {
        const { bytesRemoved, removedData } = iterator.removeBytesRead(force, mode);
        if (bytesRemoved) {
            log_1.Log.verbose(logLevel, `Freed ${bytesRemoved} bytes`);
        }
        if (removedData && onDiscardedData) {
            await onDiscardedData(removedData);
        }
    };
    const fields = (0, get_fields_from_callbacks_1.getFieldsFromCallback)({
        fields: fieldsInReturnValue,
        callbacks,
    });
    const mediaSection = (0, video_section_1.mediaSectionState)();
    return {
        riff: (0, riff_1.riffSpecificState)({
            controller,
            logLevel,
            readerInterface,
            src,
            prefetchCache,
            contentLength,
        }),
        transportStream: (0, transport_stream_1.transportStreamState)(),
        webm: (0, webm_1.webmState)({
            controller,
            logLevel,
            readerInterface,
            src,
            prefetchCache,
        }),
        iso: (0, iso_state_1.isoBaseMediaState)({
            contentLength,
            controller,
            readerInterface,
            src,
            logLevel,
            prefetchCache,
        }),
        mp3,
        aac: (0, aac_state_1.aacState)(),
        flac: (0, flac_state_1.flacState)(),
        m3u: (0, m3u_state_1.m3uState)(logLevel),
        timings,
        callbacks: (0, sample_callbacks_1.callbacksState)({
            controller,
            hasAudioTrackHandlers,
            hasVideoTrackHandlers,
            fields,
            keyframes,
            emittedFields,
            samplesObserved,
            structure,
            src,
            seekSignal: controller._internals.seekSignal,
            logLevel,
        }),
        getInternalStats: () => {
            var _a;
            return ({
                skippedBytes,
                finalCursorOffset: (_a = iterator.counter.getOffset()) !== null && _a !== void 0 ? _a : 0,
            });
        },
        getSkipBytes: () => skippedBytes,
        increaseSkippedBytes,
        keyframes,
        structure,
        onAudioTrack,
        onVideoTrack,
        emittedFields,
        fields,
        samplesObserved,
        contentLength,
        images,
        mediaSection,
        logLevel,
        iterator,
        controller,
        mode,
        src,
        readerInterface,
        discardReadBytes,
        selectM3uStreamFn,
        selectM3uAssociatedPlaylistsFn,
        m3uPlaylistContext,
        contentType,
        name,
        returnValue,
        callbackFunctions: callbacks,
        fieldsInReturnValue,
        mimeType,
        errored: errored,
        currentReader: currentReaderState,
        seekInfiniteLoop,
        makeSamplesStartAtZero,
        prefetchCache,
        avc,
    };
};
exports.makeParserState = makeParserState;
