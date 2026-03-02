"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canCopyVideoTrack = void 0;
const is_different_video_codec_1 = require("./is-different-video-codec");
const rotate_and_resize_video_frame_1 = require("./rotate-and-resize-video-frame");
const rotation_1 = require("./rotation");
const canCopyVideoTrack = ({ outputContainer, rotationToApply, inputContainer, resizeOperation, inputTrack, outputVideoCodec, }) => {
    if ((0, rotate_and_resize_video_frame_1.normalizeVideoRotation)(inputTrack.rotation) !==
        (0, rotate_and_resize_video_frame_1.normalizeVideoRotation)(rotationToApply)) {
        return false;
    }
    if (outputVideoCodec) {
        if (!(0, is_different_video_codec_1.isSameVideoCodec)({
            inputVideoCodec: inputTrack.codecEnum,
            outputCodec: outputVideoCodec,
        })) {
            return false;
        }
    }
    const needsToBeMultipleOfTwo = inputTrack.codecEnum === 'h264';
    const newDimensions = (0, rotation_1.calculateNewDimensionsFromRotateAndScale)({
        height: inputTrack.height,
        resizeOperation,
        rotation: rotationToApply,
        width: inputTrack.width,
        needsToBeMultipleOfTwo,
    });
    if (newDimensions.height !== inputTrack.height ||
        newDimensions.width !== inputTrack.width) {
        return false;
    }
    if (outputContainer === 'webm') {
        return inputTrack.codecEnum === 'vp8' || inputTrack.codecEnum === 'vp9';
    }
    if (outputContainer === 'mp4') {
        return ((inputTrack.codecEnum === 'h264' || inputTrack.codecEnum === 'h265') &&
            (inputContainer === 'mp4' ||
                inputContainer === 'avi' ||
                (inputContainer === 'm3u8' && inputTrack.m3uStreamFormat === 'mp4')));
    }
    if (outputContainer === 'wav') {
        return false;
    }
    throw new Error(`Unhandled codec: ${outputContainer}`);
};
exports.canCopyVideoTrack = canCopyVideoTrack;
