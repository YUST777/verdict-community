"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canReencodeVideoTrack = void 0;
const rotation_1 = require("./rotation");
const video_decoder_config_1 = require("./video-decoder-config");
const video_encoder_config_1 = require("./video-encoder-config");
const canReencodeVideoTrack = async ({ videoCodec, track, resizeOperation, rotate, }) => {
    const { height, width } = (0, rotation_1.calculateNewDimensionsFromRotateAndScale)({
        height: track.displayAspectHeight,
        resizeOperation,
        rotation: rotate ?? 0,
        needsToBeMultipleOfTwo: videoCodec === 'h264',
        width: track.displayAspectWidth,
    });
    const videoEncoderConfig = await (0, video_encoder_config_1.getVideoEncoderConfig)({
        codec: videoCodec,
        height,
        width,
        fps: track.fps,
    });
    const videoDecoderConfig = await (0, video_decoder_config_1.getVideoDecoderConfigWithHardwareAcceleration)(track);
    return Boolean(videoDecoderConfig && videoEncoderConfig);
};
exports.canReencodeVideoTrack = canReencodeVideoTrack;
