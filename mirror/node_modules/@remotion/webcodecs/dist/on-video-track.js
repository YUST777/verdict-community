"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeVideoTrackHandler = void 0;
const can_copy_video_track_1 = require("./can-copy-video-track");
const copy_video_track_1 = require("./copy-video-track");
const default_on_video_track_handler_1 = require("./default-on-video-track-handler");
const get_default_video_codec_1 = require("./get-default-video-codec");
const reencode_video_track_1 = require("./reencode-video-track");
const makeVideoTrackHandler = ({ state, onVideoFrame, onMediaStateUpdate, abortConversion, controller, defaultVideoCodec, onVideoTrack, logLevel, outputContainer, rotate, resizeOperation, progressTracker, }) => async ({ track, container: inputContainer }) => {
    if (controller._internals._mediaParserController._internals.signal.aborted) {
        throw new Error('Aborted');
    }
    const canCopyTrack = (0, can_copy_video_track_1.canCopyVideoTrack)({
        inputContainer,
        outputContainer,
        rotationToApply: rotate,
        inputTrack: track,
        resizeOperation,
        outputVideoCodec: defaultVideoCodec,
    });
    const videoOperation = await (onVideoTrack ?? default_on_video_track_handler_1.defaultOnVideoTrackHandler)({
        track,
        defaultVideoCodec: defaultVideoCodec ?? (0, get_default_video_codec_1.getDefaultVideoCodec)({ container: outputContainer }),
        logLevel,
        outputContainer,
        rotate,
        inputContainer,
        canCopyTrack,
        resizeOperation,
    });
    if (videoOperation.type === 'drop') {
        return null;
    }
    if (videoOperation.type === 'fail') {
        throw new Error(`Video track with ID ${track.trackId} resolved with {"type": "fail"}. This could mean that this video track could neither be copied to the output container or re-encoded. You have the option to drop the track instead of failing it: https://remotion.dev/docs/webcodecs/track-transformation`);
    }
    if (videoOperation.type === 'copy') {
        return (0, copy_video_track_1.copyVideoTrack)({
            logLevel,
            onMediaStateUpdate,
            state,
            track,
            progressTracker,
        });
    }
    return (0, reencode_video_track_1.reencodeVideoTrack)({
        videoOperation,
        abortConversion,
        controller,
        logLevel,
        rotate,
        track,
        onVideoFrame,
        state,
        onMediaStateUpdate,
        progressTracker,
    });
};
exports.makeVideoTrackHandler = makeVideoTrackHandler;
