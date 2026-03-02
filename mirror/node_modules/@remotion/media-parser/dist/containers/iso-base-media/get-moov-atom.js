"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoovAtom = void 0;
const buffer_iterator_1 = require("../../iterator/buffer-iterator");
const log_1 = require("../../log");
const register_track_1 = require("../../register-track");
const can_skip_tracks_1 = require("../../state/can-skip-tracks");
const has_tracks_section_1 = require("../../state/has-tracks-section");
const structure_1 = require("../../state/structure");
const process_box_1 = require("./process-box");
const traversal_1 = require("./traversal");
const getMoovAtom = async ({ endOfMdat, state, }) => {
    var _a;
    const headerSegment = (_a = state.m3uPlaylistContext) === null || _a === void 0 ? void 0 : _a.mp4HeaderSegment;
    if (headerSegment) {
        const segment = (0, traversal_1.getMoovFromFromIsoStructure)(headerSegment);
        if (!segment) {
            throw new Error('No moov box found in header segment');
        }
        return segment;
    }
    const start = Date.now();
    log_1.Log.verbose(state.logLevel, 'Starting second fetch to get moov atom');
    const { reader } = await state.readerInterface.read({
        src: state.src,
        range: endOfMdat,
        controller: state.controller,
        logLevel: state.logLevel,
        prefetchCache: state.prefetchCache,
    });
    const onAudioTrack = state.onAudioTrack
        ? async ({ track, container }) => {
            await (0, register_track_1.registerAudioTrack)({
                track,
                container,
                logLevel: state.logLevel,
                onAudioTrack: state.onAudioTrack,
                registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
                tracks: state.callbacks.tracks,
            });
            return null;
        }
        : null;
    const onVideoTrack = state.onVideoTrack
        ? async ({ track, container }) => {
            await (0, register_track_1.registerVideoTrack)({
                track,
                container,
                logLevel: state.logLevel,
                onVideoTrack: state.onVideoTrack,
                registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
                tracks: state.callbacks.tracks,
            });
            return null;
        }
        : null;
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: new Uint8Array([]),
        maxBytes: state.contentLength - endOfMdat,
        logLevel: 'error',
    });
    while (true) {
        const result = await reader.reader.read();
        if (result.value) {
            iterator.addData(result.value);
        }
        if (result.done) {
            break;
        }
    }
    const boxes = [];
    const canSkipTracksState = (0, can_skip_tracks_1.makeCanSkipTracksState)({
        hasAudioTrackHandlers: false,
        fields: { slowStructure: true },
        hasVideoTrackHandlers: false,
        structure: (0, structure_1.structureState)(),
    });
    const tracksState = (0, has_tracks_section_1.makeTracksSectionState)(canSkipTracksState, state.src);
    while (true) {
        const box = await (0, process_box_1.processBox)({
            iterator,
            logLevel: state.logLevel,
            onlyIfMoovAtomExpected: {
                tracks: tracksState,
                isoState: null,
                movieTimeScaleState: state.iso.movieTimeScale,
                onAudioTrack,
                onVideoTrack,
                registerVideoSampleCallback: () => Promise.resolve(),
                registerAudioSampleCallback: () => Promise.resolve(),
            },
            onlyIfMdatAtomExpected: null,
            contentLength: state.contentLength - endOfMdat,
        });
        if (box.type === 'box') {
            boxes.push(box.box);
        }
        if (iterator.counter.getOffset() + endOfMdat > state.contentLength) {
            throw new Error('Read past end of file');
        }
        if (iterator.counter.getOffset() + endOfMdat === state.contentLength) {
            break;
        }
    }
    const moov = boxes.find((b) => b.type === 'moov-box');
    if (!moov) {
        throw new Error('No moov box found');
    }
    log_1.Log.verbose(state.logLevel, `Finished fetching moov atom in ${Date.now() - start}ms`);
    return moov;
};
exports.getMoovAtom = getMoovAtom;
