"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectRiffBox = exports.postProcessRiffBox = void 0;
const register_track_1 = require("../../register-track");
const get_tracks_from_avi_1 = require("./get-tracks-from-avi");
const has_index_1 = require("./has-index");
const is_movi_1 = require("./is-movi");
const parse_riff_box_1 = require("./parse-riff-box");
const postProcessRiffBox = async (state, box) => {
    if (box.type === 'strh-box') {
        if (box.strf.type === 'strf-box-audio' && state.onAudioTrack) {
            const audioTrack = (0, get_tracks_from_avi_1.makeAviAudioTrack)({
                index: state.riff.getNextTrackIndex(),
                strf: box.strf,
            });
            await (0, register_track_1.registerAudioTrack)({
                track: audioTrack,
                container: 'avi',
                registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
                tracks: state.callbacks.tracks,
                logLevel: state.logLevel,
                onAudioTrack: state.onAudioTrack,
            });
        }
        if (state.onVideoTrack && box.strf.type === 'strf-box-video') {
            const videoTrack = (0, get_tracks_from_avi_1.makeAviVideoTrack)({
                strh: box,
                index: state.riff.getNextTrackIndex(),
                strf: box.strf,
            });
            (0, register_track_1.registerVideoTrackWhenProfileIsAvailable)({
                state,
                track: videoTrack,
                container: 'avi',
            });
        }
        state.riff.incrementNextTrackIndex();
    }
};
exports.postProcessRiffBox = postProcessRiffBox;
const expectRiffBox = async ({ iterator, stateIfExpectingSideEffects, }) => {
    // Need at least 16 bytes to read LIST,size,movi,size
    if (iterator.bytesRemaining() < 16) {
        return null;
    }
    const checkpoint = iterator.startCheckpoint();
    const ckId = iterator.getByteString(4, false);
    const ckSize = iterator.getUint32Le();
    if ((0, is_movi_1.isMoviAtom)(iterator, ckId)) {
        iterator.discard(4);
        if (!stateIfExpectingSideEffects) {
            throw new Error('No state if expecting side effects');
        }
        stateIfExpectingSideEffects.mediaSection.addMediaSection({
            start: iterator.counter.getOffset(),
            size: ckSize - 4,
        });
        if ((0, has_index_1.riffHasIndex)(stateIfExpectingSideEffects.structure.getRiffStructure())) {
            stateIfExpectingSideEffects.riff.lazyIdx1.triggerLoad(iterator.counter.getOffset() + ckSize - 4);
        }
        return null;
    }
    if (iterator.bytesRemaining() < ckSize) {
        checkpoint.returnToCheckpoint();
        return null;
    }
    const box = await (0, parse_riff_box_1.parseRiffBox)({
        id: ckId,
        size: ckSize,
        iterator,
        stateIfExpectingSideEffects,
    });
    return box;
};
exports.expectRiffBox = expectRiffBox;
