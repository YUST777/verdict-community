"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMedia = exports.internalRenderMedia = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const licensing_1 = require("@remotion/licensing");
const no_react_1 = require("remotion/no-react");
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const TimeoutSettings_1 = require("./browser/TimeoutSettings");
const can_use_parallel_encoding_1 = require("./can-use-parallel-encoding");
const codec_supports_media_1 = require("./codec-supports-media");
const crf_1 = require("./crf");
const default_on_log_1 = require("./default-on-log");
const delete_directory_1 = require("./delete-directory");
const ensure_frames_in_order_1 = require("./ensure-frames-in-order");
const ensure_output_directory_1 = require("./ensure-output-directory");
const find_closest_package_json_1 = require("./find-closest-package-json");
const get_concurrency_1 = require("./get-concurrency");
const get_duration_from_frame_range_1 = require("./get-duration-from-frame-range");
const get_extension_from_codec_1 = require("./get-extension-from-codec");
const get_extension_of_filename_1 = require("./get-extension-of-filename");
const get_frame_to_render_1 = require("./get-frame-to-render");
const image_format_1 = require("./image-format");
const is_audio_codec_1 = require("./is-audio-codec");
const jpeg_quality_1 = require("./jpeg-quality");
const logger_1 = require("./logger");
const make_cancel_signal_1 = require("./make-cancel-signal");
const mime_types_1 = require("./mime-types");
const color_space_1 = require("./options/color-space");
const offthreadvideo_threads_1 = require("./options/offthreadvideo-threads");
const x264_preset_1 = require("./options/x264-preset");
const overwrite_1 = require("./overwrite");
const perf_1 = require("./perf");
const pixel_format_1 = require("./pixel-format");
const prepare_server_1 = require("./prepare-server");
const prespawn_ffmpeg_1 = require("./prespawn-ffmpeg");
const prestitcher_memory_usage_1 = require("./prestitcher-memory-usage");
const prores_profile_1 = require("./prores-profile");
const render_frames_1 = require("./render-frames");
const repro_1 = require("./repro");
const stitch_frames_to_video_1 = require("./stitch-frames-to-video");
const succeed_or_cancel_1 = require("./succeed-or-cancel");
const validate_1 = require("./validate");
const validate_even_dimensions_with_codec_1 = require("./validate-even-dimensions-with-codec");
const validate_every_nth_frame_1 = require("./validate-every-nth-frame");
const validate_ffmpeg_override_1 = require("./validate-ffmpeg-override");
const validate_number_of_gif_loops_1 = require("./validate-number-of-gif-loops");
const validate_output_filename_1 = require("./validate-output-filename");
const validate_scale_1 = require("./validate-scale");
const validate_videobitrate_1 = require("./validate-videobitrate");
const wrap_with_error_handling_1 = require("./wrap-with-error-handling");
const SLOWEST_FRAME_COUNT = 10;
const MAX_RECENT_FRAME_TIMINGS = 150;
const internalRenderMediaRaw = ({ proResProfile, x264Preset, crf, composition: compositionWithPossibleUnevenDimensions, serializedInputPropsWithCustomSchema, pixelFormat: userPixelFormat, codec, envVariables, frameRange, puppeteerInstance, outputLocation, onProgress, overwrite, onDownload, onBrowserLog, onStart, timeoutInMilliseconds, chromiumOptions, scale, browserExecutable, port, cancelSignal, muted, enforceAudioTrack, ffmpegOverride, audioBitrate, videoBitrate, encodingMaxRate, encodingBufferSize, audioCodec, concurrency, disallowParallelEncoding, everyNthFrame, imageFormat: provisionalImageFormat, indent, jpegQuality, numberOfGifLoops, onCtrlCExit, preferLossless, serveUrl, server: reusedServer, logLevel, serializedResolvedPropsWithCustomSchema, offthreadVideoCacheSizeInBytes, colorSpace, repro, binariesDirectory, separateAudioTo, forSeamlessAacConcatenation, compositionStart, onBrowserDownload, onArtifact, metadata, hardwareAcceleration, chromeMode, offthreadVideoThreads, mediaCacheSizeInBytes, onLog, licenseKey, isProduction, }) => {
    var _a, _b;
    const pixelFormat = (_a = userPixelFormat !== null && userPixelFormat !== void 0 ? userPixelFormat : compositionWithPossibleUnevenDimensions.defaultPixelFormat) !== null && _a !== void 0 ? _a : pixel_format_1.DEFAULT_PIXEL_FORMAT;
    if (repro) {
        (0, repro_1.enableRepro)({
            serveUrl,
            compositionName: compositionWithPossibleUnevenDimensions.id,
            serializedInputPropsWithCustomSchema,
            serializedResolvedPropsWithCustomSchema,
        });
    }
    else {
        (0, repro_1.disableRepro)();
    }
    (0, jpeg_quality_1.validateJpegQuality)(jpegQuality);
    (0, crf_1.validateQualitySettings)({
        crf,
        codec,
        videoBitrate,
        encodingMaxRate,
        encodingBufferSize,
        hardwareAcceleration,
    });
    (0, validate_videobitrate_1.validateBitrate)(audioBitrate, 'audioBitrate');
    (0, validate_videobitrate_1.validateBitrate)(videoBitrate, 'videoBitrate');
    (0, validate_videobitrate_1.validateBitrate)(encodingMaxRate, 'encodingMaxRate');
    (0, validate_videobitrate_1.validateBitrate)(encodingBufferSize, 'encodingBufferSize');
    (0, prores_profile_1.validateSelectedCodecAndProResCombination)({
        codec,
        proResProfile,
    });
    (0, x264_preset_1.validateSelectedCodecAndPresetCombination)({
        codec,
        x264Preset,
    });
    (0, pixel_format_1.validateSelectedPixelFormatAndCodecCombination)(pixelFormat, codec);
    if (outputLocation) {
        (0, validate_output_filename_1.validateOutputFilename)({
            codec,
            audioCodecSetting: audioCodec,
            extension: (0, get_extension_of_filename_1.getExtensionOfFilename)(outputLocation),
            preferLossless,
            separateAudioTo,
        });
    }
    const absoluteOutputLocation = outputLocation
        ? node_path_1.default.resolve(process.cwd(), outputLocation)
        : null;
    (0, validate_scale_1.validateScale)(scale);
    (0, validate_ffmpeg_override_1.validateFfmpegOverride)(ffmpegOverride);
    (0, validate_every_nth_frame_1.validateEveryNthFrame)(everyNthFrame);
    (0, validate_number_of_gif_loops_1.validateNumberOfGifLoops)(numberOfGifLoops, codec);
    let stitchStage = 'encoding';
    let stitcherFfmpeg;
    let preStitcher = null;
    let encodedFrames = 0;
    let muxedFrames = 0;
    let renderedFrames = 0;
    let renderedDoneIn = null;
    let encodedDoneIn = null;
    let cancelled = false;
    let renderEstimatedTime = 0;
    const recentFrameTimings = [];
    const renderStart = Date.now();
    const { estimatedUsage, freeMemory, hasEnoughMemory } = (0, prestitcher_memory_usage_1.shouldUseParallelEncoding)({
        height: compositionWithPossibleUnevenDimensions.height,
        width: compositionWithPossibleUnevenDimensions.width,
        logLevel,
    });
    const parallelEncoding = !disallowParallelEncoding &&
        hasEnoughMemory &&
        (0, can_use_parallel_encoding_1.canUseParallelEncoding)(codec);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'renderMedia()',
    }, 'Free memory:', freeMemory, 'Estimated usage parallel encoding', estimatedUsage);
    const resolvedConcurrency = (0, get_concurrency_1.resolveConcurrency)(concurrency);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'renderMedia()',
    }, 'Using concurrency:', resolvedConcurrency);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'renderMedia()',
    }, 'delayRender() timeout:', timeoutInMilliseconds);
    logger_1.Log.verbose({
        indent,
        logLevel,
        tag: 'renderMedia()',
    }, 'Codec supports parallel rendering:', (0, can_use_parallel_encoding_1.canUseParallelEncoding)(codec));
    if (disallowParallelEncoding) {
        logger_1.Log.verbose({
            indent,
            logLevel,
            tag: 'renderMedia()',
        }, 'User disallowed parallel encoding.');
    }
    if (parallelEncoding) {
        logger_1.Log.verbose({
            indent,
            logLevel,
            tag: 'renderMedia()',
        }, 'Parallel encoding is enabled.');
    }
    else {
        logger_1.Log.verbose({
            indent,
            logLevel,
            tag: 'renderMedia()',
        }, 'Parallel encoding is disabled.');
    }
    const imageFormat = (0, is_audio_codec_1.isAudioCodec)(codec)
        ? 'none'
        : ((_b = provisionalImageFormat !== null && provisionalImageFormat !== void 0 ? provisionalImageFormat : compositionWithPossibleUnevenDimensions.defaultVideoImageFormat) !== null && _b !== void 0 ? _b : image_format_1.DEFAULT_VIDEO_IMAGE_FORMAT);
    (0, image_format_1.validateSelectedPixelFormatAndImageFormatCombination)(pixelFormat, imageFormat);
    const workingDir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'react-motion-render'));
    const preEncodedFileLocation = parallelEncoding
        ? node_path_1.default.join(workingDir, 'pre-encode.' + (0, get_extension_from_codec_1.getFileExtensionFromCodec)(codec, audioCodec))
        : null;
    if (onCtrlCExit && workingDir) {
        onCtrlCExit(`Delete ${workingDir}`, () => (0, delete_directory_1.deleteDirectory)(workingDir));
    }
    const { actualWidth: widthEvenDimensions, actualHeight: heightEvenDimensions } = (0, validate_even_dimensions_with_codec_1.validateEvenDimensionsWithCodec)({
        codec,
        height: compositionWithPossibleUnevenDimensions.height,
        scale,
        width: compositionWithPossibleUnevenDimensions.width,
        wantsImageSequence: false,
        indent,
        logLevel,
    });
    const actualWidth = widthEvenDimensions * scale;
    const actualHeight = heightEvenDimensions * scale;
    const composition = {
        ...compositionWithPossibleUnevenDimensions,
        height: heightEvenDimensions,
        width: widthEvenDimensions,
    };
    const realFrameRange = (0, get_frame_to_render_1.getRealFrameRange)(composition.durationInFrames, frameRange);
    const totalFramesToRender = (0, get_duration_from_frame_range_1.getFramesToRender)(realFrameRange, everyNthFrame).length;
    logger_1.Log.verbose({ indent, logLevel, tag: 'renderMedia()' }, `Rendering frames ${realFrameRange.join('-')}`);
    const callUpdate = () => {
        const encoded = Math.round(0.8 * encodedFrames + 0.2 * muxedFrames);
        onProgress === null || onProgress === void 0 ? void 0 : onProgress({
            encodedDoneIn,
            encodedFrames: encoded,
            renderedDoneIn,
            renderedFrames,
            renderEstimatedTime,
            stitchStage,
            progress: Math.round((70 * renderedFrames + 30 * encoded) / totalFramesToRender) /
                100,
        });
    };
    const cancelRenderFrames = (0, make_cancel_signal_1.makeCancelSignal)();
    const cancelPrestitcher = (0, make_cancel_signal_1.makeCancelSignal)();
    const cancelStitcher = (0, make_cancel_signal_1.makeCancelSignal)();
    cancelSignal === null || cancelSignal === void 0 ? void 0 : cancelSignal(() => {
        cancelRenderFrames.cancel();
    });
    const { waitForRightTimeOfFrameToBeInserted, setFrameToStitch, waitForFinish } = (0, ensure_frames_in_order_1.ensureFramesInOrder)(realFrameRange);
    const fps = composition.fps / everyNthFrame;
    (0, validate_1.validateFps)(fps, 'in "renderMedia()"', codec === 'gif');
    const createPrestitcherIfNecessary = () => {
        if (preEncodedFileLocation) {
            preStitcher = (0, prespawn_ffmpeg_1.prespawnFfmpeg)({
                width: actualWidth,
                height: actualHeight,
                fps,
                outputLocation: preEncodedFileLocation,
                pixelFormat,
                codec,
                proResProfile,
                crf,
                onProgress: (frame) => {
                    encodedFrames = frame;
                    callUpdate();
                },
                logLevel,
                imageFormat,
                signal: cancelPrestitcher.cancelSignal,
                ffmpegOverride: ffmpegOverride !== null && ffmpegOverride !== void 0 ? ffmpegOverride : (({ args }) => args),
                videoBitrate,
                encodingMaxRate,
                encodingBufferSize,
                indent,
                x264Preset: x264Preset !== null && x264Preset !== void 0 ? x264Preset : null,
                colorSpace,
                binariesDirectory,
                hardwareAcceleration,
            });
            stitcherFfmpeg = preStitcher.task;
        }
    };
    const waitForPrestitcherIfNecessary = async () => {
        var _a;
        if (stitcherFfmpeg) {
            await waitForFinish();
            (_a = stitcherFfmpeg === null || stitcherFfmpeg === void 0 ? void 0 : stitcherFfmpeg.stdin) === null || _a === void 0 ? void 0 : _a.end();
            try {
                await stitcherFfmpeg;
            }
            catch (_b) {
                throw new Error(preStitcher === null || preStitcher === void 0 ? void 0 : preStitcher.getLogs());
            }
        }
        return { usesParallelEncoding: Boolean(stitcherFfmpeg) };
    };
    const mediaSupport = (0, codec_supports_media_1.codecSupportsMedia)(codec);
    const disableAudio = !mediaSupport.audio || muted;
    const slowestFrames = [];
    let maxTime = 0;
    let minTime = 0;
    const recordFrameTime = (frameIndex, time) => {
        var _a;
        var _b;
        const frameTime = { frame: frameIndex, time };
        if (time < minTime && slowestFrames.length === SLOWEST_FRAME_COUNT) {
            return;
        }
        if (time > maxTime) {
            // add at starting;
            slowestFrames.unshift(frameTime);
            maxTime = time;
        }
        else {
            // add frame at appropriate position
            const index = slowestFrames.findIndex(({ time: indexTime }) => indexTime < time);
            slowestFrames.splice(index, 0, frameTime);
        }
        if (slowestFrames.length > SLOWEST_FRAME_COUNT) {
            slowestFrames.pop();
        }
        minTime = (_b = (_a = slowestFrames[slowestFrames.length - 1]) === null || _a === void 0 ? void 0 : _a.time) !== null && _b !== void 0 ? _b : minTime;
    };
    let cleanupServerFn = () => Promise.resolve(undefined);
    const happyPath = new Promise((resolve, reject) => {
        Promise.resolve(createPrestitcherIfNecessary())
            .then(() => {
            return (0, prepare_server_1.makeOrReuseServer)(reusedServer, {
                offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : offthreadvideo_threads_1.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
                indent,
                port,
                remotionRoot: (0, find_closest_package_json_1.findRemotionRoot)(),
                logLevel,
                webpackConfigOrServeUrl: serveUrl,
                offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes !== null && offthreadVideoCacheSizeInBytes !== void 0 ? offthreadVideoCacheSizeInBytes : null,
                binariesDirectory,
                forceIPv4: false,
            }, {
                onDownload,
            });
        })
            .then(({ server, cleanupServer }) => {
            cleanupServerFn = cleanupServer;
            let timeOfLastFrame = Date.now();
            const renderFramesProc = (0, render_frames_1.internalRenderFrames)({
                composition,
                onFrameUpdate: (frame, frameIndex) => {
                    renderedFrames = frame;
                    const now = Date.now();
                    const timeToRenderInMilliseconds = now - timeOfLastFrame;
                    timeOfLastFrame = now;
                    // Track recent frame timings (at most 50)
                    recentFrameTimings.push(timeToRenderInMilliseconds);
                    if (recentFrameTimings.length > MAX_RECENT_FRAME_TIMINGS) {
                        recentFrameTimings.shift();
                    }
                    // Calculate average using only recent timings for better estimation
                    const recentTimingsSum = recentFrameTimings.reduce((sum, time) => sum + time, 0);
                    const newAverage = recentTimingsSum / recentFrameTimings.length;
                    const remainingFrames = totalFramesToRender - renderedFrames;
                    // Get estimated time by multiplying the avarage render time by the remaining frames
                    renderEstimatedTime = Math.round(remainingFrames * newAverage);
                    callUpdate();
                    recordFrameTime(frameIndex, timeToRenderInMilliseconds);
                },
                concurrency,
                outputDir: parallelEncoding ? null : workingDir,
                onStart: (data) => {
                    renderedFrames = 0;
                    callUpdate();
                    onStart === null || onStart === void 0 ? void 0 : onStart(data);
                },
                serializedInputPropsWithCustomSchema,
                envVariables,
                imageFormat,
                jpegQuality,
                frameRange,
                puppeteerInstance,
                everyNthFrame,
                onFrameBuffer: parallelEncoding
                    ? async (buffer, frame) => {
                        var _a;
                        await waitForRightTimeOfFrameToBeInserted(frame);
                        if (cancelled) {
                            return;
                        }
                        const id = (0, perf_1.startPerfMeasure)('piping');
                        const exitStatus = preStitcher === null || preStitcher === void 0 ? void 0 : preStitcher.getExitStatus();
                        if ((exitStatus === null || exitStatus === void 0 ? void 0 : exitStatus.type) === 'quit-successfully') {
                            throw new Error(`FFmpeg already quit while trying to pipe frame ${frame} to it. Stderr: ${exitStatus.stderr}`);
                        }
                        if ((exitStatus === null || exitStatus === void 0 ? void 0 : exitStatus.type) === 'quit-with-error') {
                            throw new Error(`FFmpeg quit with code ${exitStatus.exitCode}${exitStatus.signal ? ` (signal ${exitStatus.signal})` : ''} while piping frame ${frame}. Stderr: ${exitStatus.stderr}`);
                        }
                        (_a = stitcherFfmpeg === null || stitcherFfmpeg === void 0 ? void 0 : stitcherFfmpeg.stdin) === null || _a === void 0 ? void 0 : _a.write(buffer);
                        (0, perf_1.stopPerfMeasure)(id);
                        setFrameToStitch(Math.min(realFrameRange[1] + 1, frame + everyNthFrame));
                    }
                    : null,
                webpackBundleOrServeUrl: serveUrl,
                onBrowserLog,
                onDownload,
                timeoutInMilliseconds,
                chromiumOptions,
                scale,
                browserExecutable,
                port,
                cancelSignal: cancelRenderFrames.cancelSignal,
                muted: disableAudio,
                logLevel,
                indent,
                server,
                serializedResolvedPropsWithCustomSchema,
                offthreadVideoCacheSizeInBytes,
                offthreadVideoThreads,
                parallelEncodingEnabled: parallelEncoding,
                binariesDirectory,
                compositionStart,
                forSeamlessAacConcatenation,
                onBrowserDownload,
                onArtifact,
                chromeMode,
                imageSequencePattern: null,
                mediaCacheSizeInBytes,
                onLog,
            });
            return renderFramesProc;
        })
            .then((renderFramesReturn) => {
            return Promise.all([
                renderFramesReturn,
                waitForPrestitcherIfNecessary(),
            ]);
        })
            .then(([{ assetsInfo }]) => {
            renderedDoneIn = Date.now() - renderStart;
            logger_1.Log.verbose({ indent, logLevel }, 'Rendering frames done in', renderedDoneIn + 'ms');
            if (absoluteOutputLocation) {
                (0, ensure_output_directory_1.ensureOutputDirectory)(absoluteOutputLocation);
            }
            const stitchStart = Date.now();
            return (0, stitch_frames_to_video_1.internalStitchFramesToVideo)({
                width: Math.round(actualWidth),
                height: Math.round(actualHeight),
                fps,
                outputLocation: absoluteOutputLocation,
                preEncodedFileLocation,
                preferLossless,
                indent,
                force: overwrite,
                pixelFormat,
                codec,
                proResProfile,
                crf,
                assetsInfo,
                onProgress: (frame) => {
                    // With seamless AAC concatenation, the amount of rendered frames
                    // might be longer, so we need to clamp it to avoid progress over 100%
                    if (preEncodedFileLocation) {
                        stitchStage = 'muxing';
                        muxedFrames = Math.min(frame, totalFramesToRender);
                    }
                    else {
                        muxedFrames = Math.min(frame, totalFramesToRender);
                        encodedFrames = Math.min(frame, totalFramesToRender);
                    }
                    if (encodedFrames === totalFramesToRender) {
                        encodedDoneIn = Date.now() - stitchStart;
                    }
                    if (frame > 0) {
                        callUpdate();
                    }
                },
                onDownload,
                numberOfGifLoops,
                logLevel,
                cancelSignal: cancelStitcher.cancelSignal,
                muted: disableAudio,
                enforceAudioTrack,
                ffmpegOverride: ffmpegOverride !== null && ffmpegOverride !== void 0 ? ffmpegOverride : null,
                audioBitrate,
                videoBitrate,
                bufferSize: encodingBufferSize,
                maxRate: encodingMaxRate,
                audioCodec,
                x264Preset: x264Preset !== null && x264Preset !== void 0 ? x264Preset : null,
                colorSpace,
                binariesDirectory,
                separateAudioTo,
                metadata,
                hardwareAcceleration,
            });
        })
            .then((buffer) => {
            logger_1.Log.verbose({ indent, logLevel }, 'Stitching done in', encodedDoneIn + 'ms');
            slowestFrames.sort((a, b) => b.time - a.time);
            const result = {
                buffer,
                slowestFrames,
                contentType: (0, mime_types_1.mimeLookup)('file.' + (0, get_extension_from_codec_1.getFileExtensionFromCodec)(codec, audioCodec)) || 'application/octet-stream',
            };
            const sendTelemetryAndResolve = () => {
                if (licenseKey === null) {
                    resolve(result);
                    return;
                }
                licensing_1.LicensingInternals.internalRegisterUsageEvent({
                    event: 'cloud-render',
                    host: null,
                    succeeded: true,
                    licenseKey: licenseKey !== null && licenseKey !== void 0 ? licenseKey : null,
                    isProduction: isProduction !== null && isProduction !== void 0 ? isProduction : true,
                    isStill: false,
                })
                    .then(() => {
                    logger_1.Log.verbose({ indent, logLevel }, 'Usage event sent successfully');
                })
                    .catch((err) => {
                    logger_1.Log.error({ indent, logLevel }, 'Failed to send usage event');
                    logger_1.Log.error({ indent: true, logLevel }, err);
                })
                    .finally(() => {
                    resolve(result);
                });
            };
            if ((0, repro_1.isReproEnabled)()) {
                (0, repro_1.getReproWriter)()
                    .onRenderSucceed({ indent, logLevel, output: absoluteOutputLocation })
                    .then(() => {
                    sendTelemetryAndResolve();
                })
                    .catch((err) => {
                    logger_1.Log.error({ indent, logLevel }, 'Could not create reproduction', err);
                    sendTelemetryAndResolve();
                });
            }
            else {
                sendTelemetryAndResolve();
            }
        })
            .catch((err) => {
            /**
             * When an error is thrown in renderFrames(...) (e.g., when delayRender() is used incorrectly), fs.unlinkSync(...) throws an error that the file is locked because ffmpeg is still running, and renderMedia returns it.
             * Therefore we first kill the FFMPEG process before deleting the file
             */
            cancelled = true;
            cancelRenderFrames.cancel();
            cancelStitcher.cancel();
            cancelPrestitcher.cancel();
            if (stitcherFfmpeg !== undefined && stitcherFfmpeg.exitCode === null) {
                const promise = new Promise((res) => {
                    setTimeout(() => {
                        res();
                    }, 2000);
                    stitcherFfmpeg.on('close', res);
                });
                // An exception can happen here:
                // https://discord.com/channels/809501355504959528/817306238811111454/1273184655348072468
                try {
                    stitcherFfmpeg.kill();
                }
                catch (_a) {
                    // Ignore
                }
                return promise.then(() => {
                    reject(err);
                });
            }
            reject(err);
        })
            .finally(() => {
            if (preEncodedFileLocation !== null &&
                node_fs_1.default.existsSync(preEncodedFileLocation)) {
                (0, delete_directory_1.deleteDirectory)(node_path_1.default.dirname(preEncodedFileLocation));
            }
            // Clean temporary image frames when rendering ends or fails
            if (workingDir && node_fs_1.default.existsSync(workingDir)) {
                (0, delete_directory_1.deleteDirectory)(workingDir);
            }
            cleanupServerFn === null || cleanupServerFn === void 0 ? void 0 : cleanupServerFn(false).catch((err) => {
                // Must prevent unhandled exception in cleanup function.
                // Might crash whole runtime.
                logger_1.Log.error({ indent, logLevel }, 'Could not cleanup: ', err);
            });
        });
    });
    return (0, succeed_or_cancel_1.succeedOrCancel)({
        happyPath,
        cancelSignal,
        cancelMessage: make_cancel_signal_1.cancelErrorMessages.renderMedia,
    });
};
exports.internalRenderMedia = (0, wrap_with_error_handling_1.wrapWithErrorHandling)(internalRenderMediaRaw);
/*
 * @description Render a video or an audio programmatically.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-media)
 */
const renderMedia = ({ proResProfile, x264Preset, crf, composition, inputProps, pixelFormat, codec, envVariables, frameRange, puppeteerInstance, outputLocation, onProgress, overwrite, onDownload, onBrowserLog, onStart, timeoutInMilliseconds, chromiumOptions, scale, browserExecutable, port, cancelSignal, muted, enforceAudioTrack, ffmpegOverride, audioBitrate, videoBitrate, encodingMaxRate, encodingBufferSize, audioCodec, jpegQuality, concurrency, serveUrl, disallowParallelEncoding, everyNthFrame, imageFormat, numberOfGifLoops, dumpBrowserLogs, preferLossless, verbose, quality, logLevel: passedLogLevel, offthreadVideoCacheSizeInBytes, colorSpace, repro, binariesDirectory, separateAudioTo, forSeamlessAacConcatenation, onBrowserDownload, onArtifact, metadata, hardwareAcceleration, chromeMode, offthreadVideoThreads, compositionStart, mediaCacheSizeInBytes, isProduction, ...apiKeyOrLicenseKey }) => {
    var _a, _b, _c;
    const indent = false;
    const logLevel = verbose || dumpBrowserLogs ? 'verbose' : (passedLogLevel !== null && passedLogLevel !== void 0 ? passedLogLevel : 'info');
    if (quality !== undefined) {
        logger_1.Log.warn({ indent, logLevel }, `The "quality" option has been renamed. Please use "jpegQuality" instead.`);
    }
    const licenseKey = 'licenseKey' in apiKeyOrLicenseKey ? apiKeyOrLicenseKey.licenseKey : null;
    const apiKey = 'apiKey' in apiKeyOrLicenseKey ? apiKeyOrLicenseKey.apiKey : null;
    return (0, exports.internalRenderMedia)({
        proResProfile: proResProfile !== null && proResProfile !== void 0 ? proResProfile : undefined,
        x264Preset: x264Preset !== null && x264Preset !== void 0 ? x264Preset : null,
        codec,
        composition,
        serveUrl,
        audioBitrate: audioBitrate !== null && audioBitrate !== void 0 ? audioBitrate : null,
        audioCodec: audioCodec !== null && audioCodec !== void 0 ? audioCodec : null,
        browserExecutable: browserExecutable !== null && browserExecutable !== void 0 ? browserExecutable : null,
        cancelSignal,
        chromiumOptions: chromiumOptions !== null && chromiumOptions !== void 0 ? chromiumOptions : {},
        concurrency: concurrency !== null && concurrency !== void 0 ? concurrency : null,
        crf: crf !== null && crf !== void 0 ? crf : null,
        disallowParallelEncoding: disallowParallelEncoding !== null && disallowParallelEncoding !== void 0 ? disallowParallelEncoding : false,
        enforceAudioTrack: enforceAudioTrack !== null && enforceAudioTrack !== void 0 ? enforceAudioTrack : false,
        envVariables: envVariables !== null && envVariables !== void 0 ? envVariables : {},
        everyNthFrame: everyNthFrame !== null && everyNthFrame !== void 0 ? everyNthFrame : 1,
        ffmpegOverride: ffmpegOverride !== null && ffmpegOverride !== void 0 ? ffmpegOverride : undefined,
        frameRange: frameRange !== null && frameRange !== void 0 ? frameRange : null,
        imageFormat: imageFormat !== null && imageFormat !== void 0 ? imageFormat : null,
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            indent: undefined,
            staticBase: null,
            data: inputProps !== null && inputProps !== void 0 ? inputProps : {},
        }).serializedString,
        jpegQuality: (_a = jpegQuality !== null && jpegQuality !== void 0 ? jpegQuality : quality) !== null && _a !== void 0 ? _a : jpeg_quality_1.DEFAULT_JPEG_QUALITY,
        muted: muted !== null && muted !== void 0 ? muted : false,
        numberOfGifLoops: numberOfGifLoops !== null && numberOfGifLoops !== void 0 ? numberOfGifLoops : null,
        onBrowserLog: onBrowserLog !== null && onBrowserLog !== void 0 ? onBrowserLog : null,
        onDownload: onDownload !== null && onDownload !== void 0 ? onDownload : (() => undefined),
        onProgress: onProgress !== null && onProgress !== void 0 ? onProgress : (() => undefined),
        onStart: onStart !== null && onStart !== void 0 ? onStart : (() => undefined),
        outputLocation: outputLocation !== null && outputLocation !== void 0 ? outputLocation : null,
        overwrite: overwrite !== null && overwrite !== void 0 ? overwrite : overwrite_1.DEFAULT_OVERWRITE,
        pixelFormat: pixelFormat !== null && pixelFormat !== void 0 ? pixelFormat : null,
        port: port !== null && port !== void 0 ? port : null,
        puppeteerInstance: puppeteerInstance !== null && puppeteerInstance !== void 0 ? puppeteerInstance : undefined,
        scale: scale !== null && scale !== void 0 ? scale : 1,
        timeoutInMilliseconds: timeoutInMilliseconds !== null && timeoutInMilliseconds !== void 0 ? timeoutInMilliseconds : TimeoutSettings_1.DEFAULT_TIMEOUT,
        videoBitrate: videoBitrate !== null && videoBitrate !== void 0 ? videoBitrate : null,
        encodingMaxRate: encodingMaxRate !== null && encodingMaxRate !== void 0 ? encodingMaxRate : null,
        encodingBufferSize: encodingBufferSize !== null && encodingBufferSize !== void 0 ? encodingBufferSize : null,
        logLevel,
        preferLossless: preferLossless !== null && preferLossless !== void 0 ? preferLossless : false,
        indent,
        onCtrlCExit: () => undefined,
        server: undefined,
        serializedResolvedPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            indent: undefined,
            staticBase: null,
            data: (_b = composition.props) !== null && _b !== void 0 ? _b : {},
        }).serializedString,
        offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes !== null && offthreadVideoCacheSizeInBytes !== void 0 ? offthreadVideoCacheSizeInBytes : null,
        offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : null,
        colorSpace: colorSpace !== null && colorSpace !== void 0 ? colorSpace : color_space_1.DEFAULT_COLOR_SPACE,
        repro: repro !== null && repro !== void 0 ? repro : false,
        binariesDirectory: binariesDirectory !== null && binariesDirectory !== void 0 ? binariesDirectory : null,
        separateAudioTo: separateAudioTo !== null && separateAudioTo !== void 0 ? separateAudioTo : null,
        forSeamlessAacConcatenation: forSeamlessAacConcatenation !== null && forSeamlessAacConcatenation !== void 0 ? forSeamlessAacConcatenation : false,
        onBrowserDownload: onBrowserDownload !== null && onBrowserDownload !== void 0 ? onBrowserDownload : (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({
            indent,
            logLevel,
            api: 'renderMedia()',
        }),
        onArtifact: onArtifact !== null && onArtifact !== void 0 ? onArtifact : null,
        metadata: metadata !== null && metadata !== void 0 ? metadata : null,
        compositionStart: compositionStart !== null && compositionStart !== void 0 ? compositionStart : 0,
        hardwareAcceleration: hardwareAcceleration !== null && hardwareAcceleration !== void 0 ? hardwareAcceleration : 'disable',
        chromeMode: chromeMode !== null && chromeMode !== void 0 ? chromeMode : 'headless-shell',
        mediaCacheSizeInBytes: mediaCacheSizeInBytes !== null && mediaCacheSizeInBytes !== void 0 ? mediaCacheSizeInBytes : null,
        licenseKey: (_c = licenseKey !== null && licenseKey !== void 0 ? licenseKey : apiKey) !== null && _c !== void 0 ? _c : null,
        onLog: default_on_log_1.defaultOnLog,
        isProduction: isProduction !== null && isProduction !== void 0 ? isProduction : null,
    });
};
exports.renderMedia = renderMedia;
