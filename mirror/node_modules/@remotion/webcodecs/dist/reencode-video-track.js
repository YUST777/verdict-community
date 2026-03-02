"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reencodeVideoTrack = void 0;
const arraybuffer_to_uint8_array_1 = require("./arraybuffer-to-uint8-array");
const convert_encoded_chunk_1 = require("./convert-encoded-chunk");
const create_video_decoder_1 = require("./create-video-decoder");
const log_1 = require("./log");
const on_frame_1 = require("./on-frame");
const processing_queue_1 = require("./processing-queue");
const rotation_1 = require("./rotation");
const sort_video_frames_1 = require("./sort-video-frames");
const video_decoder_config_1 = require("./video-decoder-config");
const video_encoder_1 = require("./video-encoder");
const video_encoder_config_1 = require("./video-encoder-config");
const reencodeVideoTrack = async ({ videoOperation, rotate, track, logLevel, abortConversion, onMediaStateUpdate, controller, onVideoFrame, state, progressTracker, }) => {
    if (videoOperation.type !== 'reencode') {
        throw new Error(`Video track with ID ${track.trackId} could not be resolved with a valid operation. Received ${JSON.stringify(videoOperation)}, but must be either "copy", "reencode", "drop" or "fail"`);
    }
    const rotation = videoOperation.rotate ?? rotate;
    const { height: newHeight, width: newWidth } = (0, rotation_1.calculateNewDimensionsFromRotateAndScale)({
        width: track.codedWidth,
        height: track.codedHeight,
        rotation,
        needsToBeMultipleOfTwo: videoOperation.videoCodec === 'h264',
        resizeOperation: videoOperation.resize ?? null,
    });
    const videoEncoderConfig = await (0, video_encoder_config_1.getVideoEncoderConfig)({
        codec: videoOperation.videoCodec,
        height: newHeight,
        width: newWidth,
        fps: track.fps,
    });
    const videoDecoderConfig = await (0, video_decoder_config_1.getVideoDecoderConfigWithHardwareAcceleration)(track);
    log_1.Log.verbose(logLevel, 'Video encoder config', videoEncoderConfig);
    log_1.Log.verbose(logLevel, 'Video decoder config', videoDecoderConfig ?? track);
    if (videoEncoderConfig === null) {
        abortConversion(new Error(`Could not configure video encoder of track ${track.trackId}`));
        return null;
    }
    if (videoDecoderConfig === null) {
        abortConversion(new Error(`Could not configure video decoder of track ${track.trackId}`));
        return null;
    }
    const { trackNumber } = await state.addTrack({
        type: 'video',
        color: track.advancedColor,
        width: newWidth,
        height: newHeight,
        codec: videoOperation.videoCodec,
        codecPrivate: null,
        timescale: track.originalTimescale,
    });
    log_1.Log.verbose(logLevel, `Created new video track with ID ${trackNumber}, codec ${videoOperation.videoCodec} and timescale ${track.originalTimescale}`);
    const videoEncoder = (0, video_encoder_1.createVideoEncoder)({
        onChunk: async (chunk, metadata) => {
            await state.addSample({
                chunk: (0, convert_encoded_chunk_1.convertEncodedChunk)(chunk),
                trackNumber,
                isVideo: true,
                codecPrivate: (0, arraybuffer_to_uint8_array_1.arrayBufferToUint8Array)((metadata?.decoderConfig?.description ?? null)),
            });
            onMediaStateUpdate?.((prevState) => {
                return {
                    ...prevState,
                    encodedVideoFrames: prevState.encodedVideoFrames + 1,
                };
            });
        },
        onError: (err) => {
            abortConversion(new Error(`Video encoder of track ${track.trackId} failed (see .cause of this error)`, {
                cause: err,
            }));
        },
        controller,
        config: videoEncoderConfig,
        logLevel,
        outputCodec: videoOperation.videoCodec,
        keyframeInterval: 40,
    });
    const videoProcessingQueue = (0, processing_queue_1.processingQueue)({
        controller,
        label: 'VideoFrame processing queue',
        logLevel,
        onError: (err) => {
            abortConversion(new Error(`VideoFrame processing queue of track ${track.trackId} failed (see .cause of this error)`, {
                cause: err,
            }));
        },
        onOutput: async (frame) => {
            await controller._internals._mediaParserController._internals.checkForAbortAndPause();
            const processedFrame = await (0, on_frame_1.processFrame)({
                frame,
                track,
                onVideoFrame,
                outputCodec: videoOperation.videoCodec,
                rotation,
                resizeOperation: videoOperation.resize ?? null,
            });
            await controller._internals._mediaParserController._internals.checkForAbortAndPause();
            await videoEncoder.ioSynchronizer.waitForQueueSize(10);
            await controller._internals._mediaParserController._internals.checkForAbortAndPause();
            videoEncoder.encode(processedFrame);
            processedFrame.close();
        },
    });
    const frameSorter = (0, sort_video_frames_1.videoFrameSorter)({
        controller,
        onOutput: async (frame) => {
            await controller._internals._mediaParserController._internals.checkForAbortAndPause();
            await videoProcessingQueue.ioSynchronizer.waitForQueueSize(10);
            videoProcessingQueue.input(frame);
        },
    });
    const videoDecoder = await (0, create_video_decoder_1.createVideoDecoder)({
        track: videoDecoderConfig,
        onFrame: async (frame) => {
            await frameSorter.waitUntilProcessed();
            frameSorter.inputFrame(frame);
        },
        onError: (err) => {
            abortConversion(new Error(`Video decoder of track ${track.trackId} failed (see .cause of this error)`, {
                cause: err,
            }));
        },
        controller,
        logLevel,
    });
    state.addWaitForFinishPromise(async () => {
        log_1.Log.verbose(logLevel, 'Waiting for video decoder to finish');
        await videoDecoder.flush();
        videoDecoder.close();
        log_1.Log.verbose(logLevel, 'Video decoder finished. Waiting for encoder to finish');
        await frameSorter.flush();
        log_1.Log.verbose(logLevel, 'Frame sorter flushed');
        await videoProcessingQueue.ioSynchronizer.waitForQueueSize(0);
        log_1.Log.verbose(logLevel, 'Video processing queue finished');
        await videoEncoder.waitForFinish();
        videoEncoder.close();
        log_1.Log.verbose(logLevel, 'Video encoder finished');
    });
    return async (chunk) => {
        progressTracker.setPossibleLowestTimestamp(Math.min(chunk.timestamp, chunk.decodingTimestamp ?? Infinity));
        await controller._internals._mediaParserController._internals.checkForAbortAndPause();
        await videoDecoder.waitForQueueToBeLessThan(15);
        if (chunk.type === 'key') {
            await videoDecoder.flush();
        }
        videoDecoder.decode(chunk);
    };
};
exports.reencodeVideoTrack = reencodeVideoTrack;
