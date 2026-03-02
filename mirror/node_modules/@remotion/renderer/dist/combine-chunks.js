"use strict";
// Combine multiple video chunks, useful for decentralized rendering
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineChunks = exports.internalCombineChunks = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const can_concat_seamlessly_1 = require("./can-concat-seamlessly");
const combine_audio_1 = require("./combine-audio");
const combine_video_streams_1 = require("./combine-video-streams");
const combine_video_streams_seamlessly_1 = require("./combine-video-streams-seamlessly");
const get_duration_from_frame_range_1 = require("./get-duration-from-frame-range");
const get_extension_from_codec_1 = require("./get-extension-from-codec");
const get_frame_to_render_1 = require("./get-frame-to-render");
const is_audio_codec_1 = require("./is-audio-codec");
const logger_1 = require("./logger");
const mux_video_and_audio_1 = require("./mux-video-and-audio");
const audio_codec_1 = require("./options/audio-codec");
const tmp_dir_1 = require("./tmp-dir");
const truthy_1 = require("./truthy");
const validate_number_of_gif_loops_1 = require("./validate-number-of-gif-loops");
const codecSupportsFastStart = {
    'h264-mkv': false,
    'h264-ts': false,
    h264: true,
    h265: true,
    aac: false,
    gif: false,
    mp3: false,
    prores: false,
    vp8: false,
    vp9: false,
    wav: false,
};
const REMOTION_FILELIST_TOKEN = 'remotion-filelist';
const internalCombineChunks = async ({ outputLocation: output, onProgress, codec, fps, numberOfGifLoops, audioBitrate, indent, logLevel, binariesDirectory, cancelSignal, metadata, audioFiles, videoFiles, framesPerChunk, audioCodec, preferLossless, everyNthFrame, frameRange, compositionDurationInFrames, }) => {
    (0, validate_number_of_gif_loops_1.validateNumberOfGifLoops)(numberOfGifLoops, codec);
    const filelistDir = (0, tmp_dir_1.tmpDir)(REMOTION_FILELIST_TOKEN);
    const shouldCreateVideo = !(0, is_audio_codec_1.isAudioCodec)(codec);
    const resolvedAudioCodec = (0, audio_codec_1.resolveAudioCodec)({
        setting: audioCodec,
        codec,
        preferLossless,
        separateAudioTo: null,
    });
    const shouldCreateAudio = resolvedAudioCodec !== null && audioFiles.length > 0;
    const seamlessVideo = (0, can_concat_seamlessly_1.canConcatVideoSeamlessly)(codec);
    const seamlessAudio = (0, can_concat_seamlessly_1.canConcatAudioSeamlessly)(resolvedAudioCodec, framesPerChunk);
    const realFrameRange = (0, get_frame_to_render_1.getRealFrameRange)(compositionDurationInFrames, frameRange);
    const numberOfFrames = (0, get_duration_from_frame_range_1.getFramesToRender)(realFrameRange, everyNthFrame).length;
    const videoOutput = shouldCreateVideo
        ? (0, node_path_1.join)(filelistDir, `video.${(0, get_extension_from_codec_1.getFileExtensionFromCodec)(codec, resolvedAudioCodec)}`)
        : null;
    const audioOutput = shouldCreateAudio
        ? (0, node_path_1.join)(filelistDir, `audio.${(0, audio_codec_1.getExtensionFromAudioCodec)(resolvedAudioCodec)}`)
        : null;
    const chunkDurationInSeconds = framesPerChunk / fps;
    let concatenatedAudio = 0;
    let concatenatedVideo = 0;
    let muxing = 0;
    const updateProgress = () => {
        const totalFrames = (shouldCreateAudio ? numberOfFrames : 0) +
            (shouldCreateVideo ? numberOfFrames : 0) +
            numberOfFrames;
        const actualProgress = concatenatedAudio + concatenatedVideo + muxing;
        onProgress({
            frames: (actualProgress / totalFrames) * numberOfFrames,
            totalProgress: actualProgress / totalFrames,
        });
    };
    logger_1.Log.verbose({ indent, logLevel }, `Combining chunks, audio = ${shouldCreateAudio === false
        ? 'no'
        : seamlessAudio
            ? 'seamlessly'
            : 'normally'}, video = ${shouldCreateVideo === false
        ? 'no'
        : seamlessVideo
            ? 'seamlessly'
            : 'normally'}`);
    await Promise.all([
        shouldCreateAudio && audioOutput
            ? (0, combine_audio_1.createCombinedAudio)({
                audioBitrate,
                filelistDir,
                files: audioFiles,
                indent,
                logLevel,
                output: audioOutput,
                resolvedAudioCodec,
                seamless: seamlessAudio,
                chunkDurationInSeconds,
                addRemotionMetadata: !shouldCreateVideo,
                binariesDirectory,
                fps,
                cancelSignal,
                onProgress: (frames) => {
                    concatenatedAudio = frames;
                    updateProgress();
                },
            })
            : null,
        shouldCreateVideo && !seamlessVideo && videoOutput
            ? (0, combine_video_streams_1.combineVideoStreams)({
                codec,
                filelistDir,
                fps,
                indent,
                logLevel,
                numberOfGifLoops,
                output: videoOutput,
                files: videoFiles,
                addRemotionMetadata: !shouldCreateAudio,
                binariesDirectory,
                cancelSignal,
                onProgress: (frames) => {
                    concatenatedVideo = frames;
                    updateProgress();
                },
            })
            : null,
    ].filter(truthy_1.truthy));
    try {
        await (0, mux_video_and_audio_1.muxVideoAndAudio)({
            audioOutput,
            indent,
            logLevel,
            onProgress: (frames) => {
                muxing = frames;
                updateProgress();
            },
            output,
            videoOutput: seamlessVideo
                ? (0, combine_video_streams_seamlessly_1.combineVideoStreamsSeamlessly)({ files: videoFiles })
                : videoOutput,
            binariesDirectory,
            fps,
            cancelSignal,
            addFaststart: codecSupportsFastStart[codec],
            metadata,
            numberOfGifLoops,
        });
        onProgress({ totalProgress: 1, frames: numberOfFrames });
        (0, node_fs_1.rmSync)(filelistDir, { recursive: true });
    }
    catch (err) {
        (0, node_fs_1.rmSync)(filelistDir, { recursive: true });
        throw err;
    }
};
exports.internalCombineChunks = internalCombineChunks;
const combineChunks = (options) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return (0, exports.internalCombineChunks)({
        audioBitrate: (_a = options.audioBitrate) !== null && _a !== void 0 ? _a : null,
        numberOfGifLoops: (_b = options.numberOfGifLoops) !== null && _b !== void 0 ? _b : null,
        indent: false,
        logLevel: (_c = options.logLevel) !== null && _c !== void 0 ? _c : 'info',
        binariesDirectory: (_d = options.binariesDirectory) !== null && _d !== void 0 ? _d : null,
        cancelSignal: options.cancelSignal,
        metadata: (_e = options.metadata) !== null && _e !== void 0 ? _e : null,
        audioCodec: (_f = options.audioCodec) !== null && _f !== void 0 ? _f : null,
        preferLossless: options.preferLossless,
        audioFiles: options.audioFiles,
        codec: options.codec,
        fps: options.fps,
        framesPerChunk: options.framesPerChunk,
        outputLocation: options.outputLocation,
        onProgress: (_g = options.onProgress) !== null && _g !== void 0 ? _g : (() => { }),
        videoFiles: options.videoFiles,
        everyNthFrame: (_h = options.everyNthFrame) !== null && _h !== void 0 ? _h : 1,
        frameRange: (_j = options.frameRange) !== null && _j !== void 0 ? _j : null,
        compositionDurationInFrames: options.compositionDurationInFrames,
    });
};
exports.combineChunks = combineChunks;
