"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workOnSeekRequest = exports.getWorkOnSeekRequestOptions = exports.turnSeekIntoByte = void 0;
const get_seeking_byte_1 = require("./get-seeking-byte");
const get_seeking_hints_1 = require("./get-seeking-hints");
const log_1 = require("./log");
const perform_seek_1 = require("./perform-seek");
const turnSeekIntoByte = async ({ seek, mediaSectionState, logLevel, iterator, structureState, m3uPlaylistContext, isoState, transportStream, tracksState, webmState, keyframes, flacState, samplesObserved, riffState, mp3State, contentLength, aacState, m3uState, avcState, }) => {
    const mediaSections = mediaSectionState.getMediaSections();
    if (mediaSections.length === 0) {
        log_1.Log.trace(logLevel, 'No media sections defined, cannot seek yet');
        return {
            type: 'valid-but-must-wait',
        };
    }
    if (seek < 0) {
        throw new Error(`Cannot seek to a negative time: ${JSON.stringify(seek)}`);
    }
    const seekingHints = (0, get_seeking_hints_1.getSeekingHints)({
        riffState,
        samplesObserved,
        structureState,
        mediaSectionState,
        isoState,
        transportStream,
        tracksState,
        keyframesState: keyframes,
        webmState,
        flacState,
        mp3State,
        contentLength,
        aacState,
        m3uPlaylistContext,
    });
    if (!seekingHints) {
        log_1.Log.trace(logLevel, 'No seeking info, cannot seek yet');
        return {
            type: 'valid-but-must-wait',
        };
    }
    const seekingByte = await (0, get_seeking_byte_1.getSeekingByte)({
        info: seekingHints,
        time: seek,
        logLevel,
        currentPosition: iterator.counter.getOffset(),
        isoState,
        transportStream,
        webmState,
        mediaSection: mediaSectionState,
        m3uPlaylistContext,
        structure: structureState,
        riffState,
        m3uState,
        avcState,
    });
    return seekingByte;
};
exports.turnSeekIntoByte = turnSeekIntoByte;
const getWorkOnSeekRequestOptions = (state) => {
    return {
        logLevel: state.logLevel,
        controller: state.controller,
        isoState: state.iso,
        iterator: state.iterator,
        structureState: state.structure,
        src: state.src,
        contentLength: state.contentLength,
        readerInterface: state.readerInterface,
        mediaSection: state.mediaSection,
        m3uPlaylistContext: state.m3uPlaylistContext,
        mode: state.mode,
        seekInfiniteLoop: state.seekInfiniteLoop,
        currentReader: state.currentReader,
        discardReadBytes: state.discardReadBytes,
        fields: state.fields,
        transportStream: state.transportStream,
        tracksState: state.callbacks.tracks,
        webmState: state.webm,
        keyframes: state.keyframes,
        flacState: state.flac,
        samplesObserved: state.samplesObserved,
        riffState: state.riff,
        mp3State: state.mp3,
        aacState: state.aac,
        m3uState: state.m3u,
        prefetchCache: state.prefetchCache,
        avcState: state.avc,
    };
};
exports.getWorkOnSeekRequestOptions = getWorkOnSeekRequestOptions;
const workOnSeekRequest = async (options) => {
    const { logLevel, controller, mediaSection, m3uPlaylistContext, isoState, iterator, structureState, src, contentLength, readerInterface, mode, seekInfiniteLoop, currentReader, discardReadBytes, fields, transportStream, tracksState, webmState, keyframes, flacState, samplesObserved, riffState, mp3State, aacState, prefetchCache, m3uState, avcState, } = options;
    const seek = controller._internals.seekSignal.getSeek();
    if (seek === null) {
        return;
    }
    log_1.Log.trace(logLevel, `Has seek request for ${src}: ${JSON.stringify(seek)}`);
    const resolution = await (0, exports.turnSeekIntoByte)({
        seek,
        mediaSectionState: mediaSection,
        logLevel,
        iterator,
        structureState,
        m3uPlaylistContext,
        isoState,
        transportStream,
        tracksState,
        webmState,
        keyframes,
        flacState,
        samplesObserved,
        riffState,
        mp3State,
        contentLength,
        aacState,
        m3uState,
        avcState,
    });
    log_1.Log.trace(logLevel, `Seek action: ${JSON.stringify(resolution)}`);
    if (resolution.type === 'intermediary-seek') {
        await (0, perform_seek_1.performSeek)({
            seekTo: resolution.byte,
            userInitiated: false,
            controller,
            mediaSection,
            iterator,
            logLevel,
            mode,
            contentLength,
            seekInfiniteLoop,
            currentReader,
            readerInterface,
            src,
            discardReadBytes,
            fields,
            prefetchCache,
            isoState,
        });
        return;
    }
    if (resolution.type === 'do-seek') {
        await (0, perform_seek_1.performSeek)({
            seekTo: resolution.byte,
            userInitiated: true,
            controller,
            mediaSection,
            iterator,
            logLevel,
            mode,
            contentLength,
            seekInfiniteLoop,
            currentReader,
            readerInterface,
            src,
            discardReadBytes,
            fields,
            prefetchCache,
            isoState,
        });
        const { hasChanged } = controller._internals.seekSignal.clearSeekIfStillSame(seek);
        if (hasChanged) {
            log_1.Log.trace(logLevel, `Seek request has changed while seeking, seeking again`);
            await (0, exports.workOnSeekRequest)(options);
        }
        return;
    }
    if (resolution.type === 'invalid') {
        throw new Error(`The seek request ${JSON.stringify(seek)} cannot be processed`);
    }
    if (resolution.type === 'valid-but-must-wait') {
        log_1.Log.trace(logLevel, 'Seek request is valid but cannot be processed yet');
    }
};
exports.workOnSeekRequest = workOnSeekRequest;
