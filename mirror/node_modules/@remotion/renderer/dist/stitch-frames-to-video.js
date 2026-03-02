"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stitchFramesToVideo = exports.internalStitchFramesToVideo = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const download_map_1 = require("./assets/download-map");
const call_ffmpeg_1 = require("./call-ffmpeg");
const codec_1 = require("./codec");
const codec_supports_media_1 = require("./codec-supports-media");
const convert_number_of_gif_loops_to_ffmpeg_1 = require("./convert-number-of-gif-loops-to-ffmpeg");
const create_audio_1 = require("./create-audio");
const crf_1 = require("./crf");
const delete_directory_1 = require("./delete-directory");
const ffmpeg_args_1 = require("./ffmpeg-args");
const find_closest_package_json_1 = require("./find-closest-package-json");
const get_extension_from_codec_1 = require("./get-extension-from-codec");
const get_prores_profile_name_1 = require("./get-prores-profile-name");
const logger_1 = require("./logger");
const make_cancel_signal_1 = require("./make-cancel-signal");
const make_metadata_args_1 = require("./make-metadata-args");
const audio_codec_1 = require("./options/audio-codec");
const color_space_1 = require("./options/color-space");
const parse_ffmpeg_progress_1 = require("./parse-ffmpeg-progress");
const pixel_format_1 = require("./pixel-format");
const prores_profile_1 = require("./prores-profile");
const render_has_audio_1 = require("./render-has-audio");
const validate_1 = require("./validate");
const validate_even_dimensions_with_codec_1 = require("./validate-even-dimensions-with-codec");
const validate_videobitrate_1 = require("./validate-videobitrate");
const innerStitchFramesToVideo = async ({ assetsInfo, audioBitrate, audioCodec: audioCodecSetting, cancelSignal, codec, crf, enforceAudioTrack, ffmpegOverride, force, fps, height, indent, muted, onDownload, outputLocation, pixelFormat, preEncodedFileLocation, preferLossless, proResProfile, logLevel, videoBitrate, maxRate, bufferSize, width, numberOfGifLoops, onProgress, x264Preset, colorSpace, binariesDirectory, separateAudioTo, metadata, hardwareAcceleration, }, remotionRoot) => {
    var _a;
    (0, validate_1.validateDimension)(height, 'height', 'passed to `stitchFramesToVideo()`');
    (0, validate_1.validateDimension)(width, 'width', 'passed to `stitchFramesToVideo()`');
    (0, validate_even_dimensions_with_codec_1.validateEvenDimensionsWithCodec)({
        width,
        height,
        codec,
        scale: 1,
        wantsImageSequence: false,
        indent,
        logLevel,
    });
    (0, prores_profile_1.validateSelectedCodecAndProResCombination)({
        codec,
        proResProfile,
    });
    (0, validate_videobitrate_1.validateBitrate)(audioBitrate, 'audioBitrate');
    (0, validate_videobitrate_1.validateBitrate)(videoBitrate, 'videoBitrate');
    (0, validate_videobitrate_1.validateBitrate)(maxRate, 'maxRate');
    // bufferSize is not a bitrate but need to be validated using the same format
    (0, validate_videobitrate_1.validateBitrate)(bufferSize, 'bufferSize');
    (0, validate_1.validateFps)(fps, 'in `stitchFramesToVideo()`', false);
    assetsInfo.downloadMap.preventCleanup();
    const proResProfileName = (0, get_prores_profile_name_1.getProResProfileName)(codec, proResProfile);
    const mediaSupport = (0, codec_supports_media_1.codecSupportsMedia)(codec);
    const renderAudioEvaluation = (0, render_has_audio_1.getShouldRenderAudio)({
        assetsInfo,
        codec,
        enforceAudioTrack,
        muted,
    });
    if (renderAudioEvaluation === 'maybe') {
        throw new Error('Remotion is not sure whether to render audio. Please report this in the Remotion repo.');
    }
    const shouldRenderAudio = renderAudioEvaluation === 'yes';
    const shouldRenderVideo = mediaSupport.video;
    if (!shouldRenderAudio && !shouldRenderVideo) {
        throw new Error('The output format has neither audio nor video. This can happen if you are rendering an audio codec and the output file has no audio or the muted flag was passed.');
    }
    const resolvedAudioCodec = (0, audio_codec_1.resolveAudioCodec)({
        codec,
        preferLossless,
        setting: audioCodecSetting,
        separateAudioTo,
    });
    const tempFile = outputLocation
        ? null
        : node_path_1.default.join(assetsInfo.downloadMap.stitchFrames, `out.${(0, get_extension_from_codec_1.getFileExtensionFromCodec)(codec, resolvedAudioCodec)}`);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, 'audioCodec', resolvedAudioCodec);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, 'pixelFormat', pixelFormat);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, 'codec', codec);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, 'shouldRenderAudio', shouldRenderAudio);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, 'shouldRenderVideo', shouldRenderVideo);
    (0, crf_1.validateQualitySettings)({
        crf,
        codec,
        videoBitrate,
        encodingMaxRate: maxRate,
        encodingBufferSize: bufferSize,
        hardwareAcceleration,
    });
    (0, pixel_format_1.validateSelectedPixelFormatAndCodecCombination)(pixelFormat, codec);
    const updateProgress = (muxProgress) => {
        onProgress === null || onProgress === void 0 ? void 0 : onProgress(muxProgress);
    };
    const audio = shouldRenderAudio && resolvedAudioCodec
        ? await (0, create_audio_1.createAudio)({
            assets: assetsInfo.assets,
            onDownload,
            fps,
            chunkLengthInSeconds: assetsInfo.chunkLengthInSeconds,
            logLevel,
            onProgress: (progress) => {
                // TODO: This can be added to the overall progress calcuation
                logger_1.Log.verbose({
                    indent,
                    logLevel,
                    tag: 'audio',
                }, `Encoding progress: ${Math.round(progress * 100)}%`);
            },
            downloadMap: assetsInfo.downloadMap,
            remotionRoot,
            indent,
            binariesDirectory,
            audioBitrate,
            audioCodec: resolvedAudioCodec,
            cancelSignal: cancelSignal !== null && cancelSignal !== void 0 ? cancelSignal : undefined,
            trimLeftOffset: assetsInfo.trimLeftOffset,
            trimRightOffset: assetsInfo.trimRightOffset,
            forSeamlessAacConcatenation: assetsInfo.forSeamlessAacConcatenation,
        })
        : null;
    if (mediaSupport.audio && !mediaSupport.video) {
        if (!resolvedAudioCodec) {
            throw new TypeError('exporting audio but has no audio codec name. Report this in the Remotion repo.');
        }
        if (!audio) {
            throw new TypeError('exporting audio but has no audio file. Report this in the Remotion repo.');
        }
        if (separateAudioTo) {
            throw new Error('`separateAudioTo` was set, but this render was audio-only. This option is meant to be used for video renders.');
        }
        (0, node_fs_1.cpSync)(audio, outputLocation !== null && outputLocation !== void 0 ? outputLocation : tempFile);
        onProgress === null || onProgress === void 0 ? void 0 : onProgress(Math.round(assetsInfo.chunkLengthInSeconds * fps));
        (0, delete_directory_1.deleteDirectory)(node_path_1.default.dirname(audio));
        const file = await new Promise((resolve, reject) => {
            if (tempFile) {
                node_fs_1.promises
                    .readFile(tempFile)
                    .then((f) => {
                    return resolve(f);
                })
                    .catch((e) => reject(e));
            }
            else {
                resolve(null);
            }
        });
        (0, delete_directory_1.deleteDirectory)(assetsInfo.downloadMap.stitchFrames);
        assetsInfo.downloadMap.allowCleanup();
        return Promise.resolve(file);
    }
    const ffmpegArgs = [
        ...(preEncodedFileLocation
            ? [['-i', preEncodedFileLocation]]
            : [
                ['-r', String(fps)],
                ['-f', 'image2'],
                ['-s', `${width}x${height}`],
                ['-start_number', String(assetsInfo.firstFrameIndex)],
                ['-i', assetsInfo.imageSequenceName],
                codec === 'gif'
                    ? ['-filter_complex', 'split[v],palettegen,[v]paletteuse']
                    : null,
            ]),
        audio && !separateAudioTo ? ['-i', audio, '-c:a', 'copy'] : ['-an'],
        numberOfGifLoops === null
            ? null
            : ['-loop', (0, convert_number_of_gif_loops_to_ffmpeg_1.convertNumberOfGifLoopsToFfmpegSyntax)(numberOfGifLoops)],
        ...(0, ffmpeg_args_1.generateFfmpegArgs)({
            codec,
            crf,
            videoBitrate,
            encodingMaxRate: maxRate,
            encodingBufferSize: bufferSize,
            hasPreencoded: Boolean(preEncodedFileLocation),
            proResProfileName,
            pixelFormat,
            x264Preset,
            colorSpace,
            hardwareAcceleration,
            indent,
            logLevel,
        }),
        codec === 'h264' ? ['-movflags', 'faststart'] : null,
        // Ignore metadata that may come from remote media
        ['-map_metadata', '-1'],
        ...(0, make_metadata_args_1.makeMetadataArgs)(metadata !== null && metadata !== void 0 ? metadata : {}),
        force ? '-y' : null,
        outputLocation !== null && outputLocation !== void 0 ? outputLocation : tempFile,
    ];
    const ffmpegString = ffmpegArgs.flat(2).filter(Boolean);
    const finalFfmpegString = ffmpegOverride
        ? ffmpegOverride({ type: 'stitcher', args: ffmpegString })
        : ffmpegString;
    logger_1.Log.verbose({
        indent: indent !== null && indent !== void 0 ? indent : false,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, 'Generated final FFmpeg command:');
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'stitchFramesToVideo()',
    }, finalFfmpegString.join(' '));
    const task = (0, call_ffmpeg_1.callFfNative)({
        bin: 'ffmpeg',
        args: finalFfmpegString,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal: cancelSignal !== null && cancelSignal !== void 0 ? cancelSignal : undefined,
    });
    let ffmpegStderr = '';
    let isFinished = false;
    (_a = task.stderr) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
        var _a;
        const str = data.toString();
        ffmpegStderr += str;
        if (onProgress) {
            const parsed = (0, parse_ffmpeg_progress_1.parseFfmpegProgress)(str, fps);
            // FFMPEG bug: In some cases, FFMPEG does hang after it is finished with it's job
            // Example repo: https://github.com/JonnyBurger/ffmpeg-repro (access can be given upon request)
            if (parsed !== undefined) {
                // If two times in a row the finishing frame is logged, we quit the render
                if (parsed === assetsInfo.assets.length) {
                    if (isFinished) {
                        (_a = task.stdin) === null || _a === void 0 ? void 0 : _a.write('q');
                    }
                    else {
                        isFinished = true;
                    }
                }
                updateProgress(parsed);
            }
        }
    });
    if (separateAudioTo) {
        if (!audio) {
            throw new Error(`\`separateAudioTo\` was set to ${JSON.stringify(separateAudioTo)}, but this render included no audio`);
        }
        const finalDestination = node_path_1.default.resolve(remotionRoot, separateAudioTo);
        (0, node_fs_1.cpSync)(audio, finalDestination);
        (0, node_fs_1.rmSync)(audio);
    }
    const result = await new Promise((resolve, reject) => {
        task.once('close', (code, signal) => {
            if (code === 0) {
                if (tempFile === null) {
                    (0, download_map_1.cleanDownloadMap)(assetsInfo.downloadMap);
                    return resolve(null);
                }
                node_fs_1.promises
                    .readFile(tempFile)
                    .then((f) => {
                    resolve(f);
                })
                    .catch((e) => {
                    reject(e);
                })
                    .finally(() => {
                    (0, download_map_1.cleanDownloadMap)(assetsInfo.downloadMap);
                });
            }
            else {
                reject(new Error(`FFmpeg quit with code ${code} ${signal ? `(${signal})` : ''} The FFmpeg output was ${ffmpegStderr}`));
            }
        });
    });
    assetsInfo.downloadMap.allowCleanup();
    return result;
};
const internalStitchFramesToVideo = (options) => {
    const remotionRoot = (0, find_closest_package_json_1.findRemotionRoot)();
    const task = innerStitchFramesToVideo(options, remotionRoot);
    return Promise.race([
        task,
        new Promise((_resolve, reject) => {
            var _a;
            (_a = options.cancelSignal) === null || _a === void 0 ? void 0 : _a.call(options, () => {
                reject(new Error(make_cancel_signal_1.cancelErrorMessages.stitchFramesToVideo));
            });
        }),
    ]);
};
exports.internalStitchFramesToVideo = internalStitchFramesToVideo;
/*
 * @description Takes a series of images and audio information generated by renderFrames() and encodes it to a video.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/stitch-frames-to-video)
 */
const stitchFramesToVideo = ({ assetsInfo, force, fps, height, width, audioBitrate, audioCodec, cancelSignal, codec, crf, enforceAudioTrack, ffmpegOverride, muted, numberOfGifLoops, onDownload, onProgress, outputLocation, pixelFormat, proResProfile, verbose, videoBitrate, maxRate, bufferSize, x264Preset, colorSpace, binariesDirectory, separateAudioTo, metadata, hardwareAcceleration, }) => {
    return (0, exports.internalStitchFramesToVideo)({
        assetsInfo,
        audioBitrate: audioBitrate !== null && audioBitrate !== void 0 ? audioBitrate : null,
        maxRate: maxRate !== null && maxRate !== void 0 ? maxRate : null,
        bufferSize: bufferSize !== null && bufferSize !== void 0 ? bufferSize : null,
        audioCodec: audioCodec !== null && audioCodec !== void 0 ? audioCodec : null,
        cancelSignal: cancelSignal !== null && cancelSignal !== void 0 ? cancelSignal : null,
        codec: codec !== null && codec !== void 0 ? codec : codec_1.DEFAULT_CODEC,
        crf: crf !== null && crf !== void 0 ? crf : null,
        enforceAudioTrack: enforceAudioTrack !== null && enforceAudioTrack !== void 0 ? enforceAudioTrack : false,
        ffmpegOverride: ffmpegOverride !== null && ffmpegOverride !== void 0 ? ffmpegOverride : null,
        force: force !== null && force !== void 0 ? force : true,
        fps,
        height,
        indent: false,
        muted: muted !== null && muted !== void 0 ? muted : false,
        numberOfGifLoops: numberOfGifLoops !== null && numberOfGifLoops !== void 0 ? numberOfGifLoops : null,
        onDownload: onDownload !== null && onDownload !== void 0 ? onDownload : undefined,
        onProgress,
        outputLocation: outputLocation !== null && outputLocation !== void 0 ? outputLocation : null,
        pixelFormat: pixelFormat !== null && pixelFormat !== void 0 ? pixelFormat : pixel_format_1.DEFAULT_PIXEL_FORMAT,
        proResProfile,
        logLevel: verbose ? 'verbose' : 'info',
        videoBitrate: videoBitrate !== null && videoBitrate !== void 0 ? videoBitrate : null,
        width,
        preEncodedFileLocation: null,
        preferLossless: false,
        x264Preset: x264Preset !== null && x264Preset !== void 0 ? x264Preset : null,
        colorSpace: colorSpace !== null && colorSpace !== void 0 ? colorSpace : color_space_1.DEFAULT_COLOR_SPACE,
        binariesDirectory: binariesDirectory !== null && binariesDirectory !== void 0 ? binariesDirectory : null,
        metadata: metadata !== null && metadata !== void 0 ? metadata : null,
        separateAudioTo: separateAudioTo !== null && separateAudioTo !== void 0 ? separateAudioTo : null,
        hardwareAcceleration: hardwareAcceleration !== null && hardwareAcceleration !== void 0 ? hardwareAcceleration : 'disable',
    });
};
exports.stitchFramesToVideo = stitchFramesToVideo;
