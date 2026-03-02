"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFrames = exports.internalRenderFrames = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const no_react_1 = require("remotion/no-react");
const browser_1 = require("./browser");
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const flaky_errors_1 = require("./browser/flaky-errors");
const TimeoutSettings_1 = require("./browser/TimeoutSettings");
const can_use_parallel_encoding_1 = require("./can-use-parallel-encoding");
const cycle_browser_tabs_1 = require("./cycle-browser-tabs");
const default_on_log_1 = require("./default-on-log");
const find_closest_package_json_1 = require("./find-closest-package-json");
const get_concurrency_1 = require("./get-concurrency");
const get_duration_from_frame_range_1 = require("./get-duration-from-frame-range");
const get_extra_frames_to_capture_1 = require("./get-extra-frames-to-capture");
const get_frame_padded_index_1 = require("./get-frame-padded-index");
const get_frame_to_render_1 = require("./get-frame-to-render");
const jpeg_quality_1 = require("./jpeg-quality");
const logger_1 = require("./logger");
const make_cancel_signal_1 = require("./make-cancel-signal");
const make_page_1 = require("./make-page");
const next_frame_to_render_1 = require("./next-frame-to-render");
const open_browser_1 = require("./open-browser");
const offthreadvideo_threads_1 = require("./options/offthreadvideo-threads");
const pool_1 = require("./pool");
const prepare_server_1 = require("./prepare-server");
const render_frame_and_retry_target_close_1 = require("./render-frame-and-retry-target-close");
const replace_browser_1 = require("./replace-browser");
const validate_1 = require("./validate");
const validate_scale_1 = require("./validate-scale");
const wrap_with_error_handling_1 = require("./wrap-with-error-handling");
const MAX_RETRIES_PER_FRAME = 1;
const innerRenderFrames = async ({ onFrameUpdate, outputDir, onStart, serializedInputPropsWithCustomSchema, serializedResolvedPropsWithCustomSchema, jpegQuality, imageFormat, frameRange, onError, envVariables, onBrowserLog, onFrameBuffer, onDownload, pagesArray, serveUrl, composition, timeoutInMilliseconds, scale, resolvedConcurrency, everyNthFrame, proxyPort, cancelSignal, downloadMap, muted, makeBrowser, browserReplacer, sourceMapGetter, logLevel, indent, parallelEncodingEnabled, compositionStart, forSeamlessAacConcatenation, onArtifact, binariesDirectory, imageSequencePattern, mediaCacheSizeInBytes, onLog, darkMode, }) => {
    if (outputDir) {
        if (!node_fs_1.default.existsSync(outputDir)) {
            node_fs_1.default.mkdirSync(outputDir, {
                recursive: true,
            });
        }
    }
    const downloadPromises = [];
    const realFrameRange = (0, get_frame_to_render_1.getRealFrameRange)(composition.durationInFrames, frameRange);
    const { extraFramesToCaptureAssetsBackend, extraFramesToCaptureAssetsFrontend, chunkLengthInSeconds, trimLeftOffset, trimRightOffset, } = (0, get_extra_frames_to_capture_1.getExtraFramesToCapture)({
        fps: composition.fps,
        compositionStart,
        realFrameRange,
        forSeamlessAacConcatenation,
    });
    const framesToRender = (0, get_duration_from_frame_range_1.getFramesToRender)(realFrameRange, everyNthFrame);
    const lastFrame = framesToRender[framesToRender.length - 1];
    const concurrencyOrFramesToRender = Math.min(framesToRender.length, resolvedConcurrency);
    const makeNewPage = (frame, pageIndex) => {
        return (0, make_page_1.makePage)({
            context: sourceMapGetter,
            initialFrame: frame,
            browserReplacer,
            indent,
            logLevel,
            onBrowserLog,
            pagesArray,
            scale,
            composition,
            envVariables,
            imageFormat,
            muted,
            proxyPort,
            serializedInputPropsWithCustomSchema,
            serializedResolvedPropsWithCustomSchema,
            serveUrl,
            timeoutInMilliseconds,
            pageIndex,
            isMainTab: pageIndex === 0,
            mediaCacheSizeInBytes,
            onLog,
            darkMode,
        });
    };
    const getPool = async () => {
        const pages = new Array(concurrencyOrFramesToRender)
            .fill(true)
            // TODO: Change different initial frame
            .map((_, i) => makeNewPage(framesToRender[i], i));
        const puppeteerPages = await Promise.all(pages);
        const pool = new pool_1.Pool(puppeteerPages);
        return pool;
    };
    // If rendering a GIF and skipping frames, we must ensure it starts from 0
    // and then is consecutive so FFMPEG recognizes the sequence
    const countType = everyNthFrame === 1 ? 'actual-frames' : 'from-zero';
    const filePadLength = (0, get_frame_padded_index_1.getFilePadLength)({
        lastFrame,
        totalFrames: framesToRender.length,
        countType,
    });
    const framesRenderedObj = {
        count: 0,
    };
    const poolPromise = getPool();
    onStart === null || onStart === void 0 ? void 0 : onStart({
        frameCount: framesToRender.length,
        parallelEncoding: parallelEncodingEnabled,
        resolvedConcurrency,
    });
    const assets = [];
    const stoppedSignal = { stopped: false };
    cancelSignal === null || cancelSignal === void 0 ? void 0 : cancelSignal(() => {
        stoppedSignal.stopped = true;
    });
    const frameDir = outputDir !== null && outputDir !== void 0 ? outputDir : downloadMap.compositingDir;
    // Render the extra frames at the beginning of the video first,
    // then the regular frames, then the extra frames at the end of the video.
    // While the order technically doesn't matter, components such as <Html5Video> are
    // not always frame perfect and give a flicker.
    // We reduce the chance of flicker by rendering the frames in order.
    const allFramesAndExtraFrames = [
        ...extraFramesToCaptureAssetsFrontend,
        ...framesToRender,
        ...extraFramesToCaptureAssetsBackend,
    ];
    const shouldUsePartitionedRendering = (0, can_use_parallel_encoding_1.getShouldUsePartitionedRendering)();
    if (shouldUsePartitionedRendering) {
        logger_1.Log.info({ indent, logLevel }, 'Experimental: Using partitioned rendering (https://github.com/remotion-dev/remotion/pull/4830)');
    }
    const nextFrameToRender = shouldUsePartitionedRendering
        ? (0, next_frame_to_render_1.partitionedNextFrameToRenderState)({
            allFramesAndExtraFrames,
            concurrencyOrFramesToRender,
        })
        : (0, next_frame_to_render_1.nextFrameToRenderState)({
            allFramesAndExtraFrames,
            concurrencyOrFramesToRender,
        });
    const pattern = imageSequencePattern || `element-[frame].[ext]`;
    const imageSequenceName = pattern
        .replace(/\[frame\]/g, `%0${filePadLength}d`)
        .replace(/\[ext\]/g, imageFormat);
    await Promise.all(allFramesAndExtraFrames.map(() => {
        return (0, render_frame_and_retry_target_close_1.renderFrameAndRetryTargetClose)({
            retriesLeft: MAX_RETRIES_PER_FRAME,
            attempt: 1,
            assets,
            binariesDirectory,
            cancelSignal,
            composition,
            countType,
            downloadMap,
            frameDir,
            framesToRender,
            imageFormat,
            indent,
            jpegQuality,
            logLevel,
            onArtifact,
            onDownload,
            onError,
            outputDir,
            poolPromise,
            scale,
            stoppedSignal,
            timeoutInMilliseconds,
            makeBrowser,
            browserReplacer,
            concurrencyOrFramesToRender,
            framesRenderedObj,
            lastFrame,
            makeNewPage,
            onFrameBuffer,
            onFrameUpdate,
            nextFrameToRender,
            imageSequencePattern: pattern,
            trimLeftOffset,
            trimRightOffset,
            allFramesAndExtraFrames,
        });
    }));
    const firstFrameIndex = countType === 'from-zero' ? 0 : framesToRender[0];
    await Promise.all(downloadPromises);
    return {
        assetsInfo: {
            assets: assets.sort((a, b) => {
                return a.frame - b.frame;
            }),
            imageSequenceName: node_path_1.default.join(frameDir, imageSequenceName),
            firstFrameIndex,
            downloadMap,
            trimLeftOffset,
            trimRightOffset,
            chunkLengthInSeconds,
            forSeamlessAacConcatenation,
        },
        frameCount: framesToRender.length,
    };
};
const internalRenderFramesRaw = ({ browserExecutable, cancelSignal, chromiumOptions, composition, concurrency, envVariables, everyNthFrame, frameRange, imageFormat, indent, jpegQuality, muted, onBrowserLog, onDownload, onFrameBuffer, onFrameUpdate, onStart, outputDir, port, puppeteerInstance, scale, server, timeoutInMilliseconds, logLevel, webpackBundleOrServeUrl, serializedInputPropsWithCustomSchema, serializedResolvedPropsWithCustomSchema, offthreadVideoCacheSizeInBytes, parallelEncodingEnabled, binariesDirectory, forSeamlessAacConcatenation, compositionStart, onBrowserDownload, onArtifact, chromeMode, offthreadVideoThreads, imageSequencePattern, mediaCacheSizeInBytes, onLog, }) => {
    (0, validate_1.validateDimension)(composition.height, 'height', 'in the `config` object passed to `renderFrames()`');
    (0, validate_1.validateDimension)(composition.width, 'width', 'in the `config` object passed to `renderFrames()`');
    (0, validate_1.validateFps)(composition.fps, 'in the `config` object of `renderFrames()`', false);
    (0, validate_1.validateDurationInFrames)(composition.durationInFrames, {
        component: 'in the `config` object passed to `renderFrames()`',
        allowFloats: false,
    });
    (0, jpeg_quality_1.validateJpegQuality)(jpegQuality);
    (0, validate_scale_1.validateScale)(scale);
    const makeBrowser = () => (0, open_browser_1.internalOpenBrowser)({
        browser: browser_1.DEFAULT_BROWSER,
        browserExecutable,
        chromiumOptions,
        forceDeviceScaleFactor: scale,
        indent,
        viewport: null,
        logLevel,
        onBrowserDownload,
        chromeMode,
    });
    const browserInstance = puppeteerInstance !== null && puppeteerInstance !== void 0 ? puppeteerInstance : makeBrowser();
    const resolvedConcurrency = (0, get_concurrency_1.resolveConcurrency)(concurrency);
    const openedPages = [];
    return new Promise((resolve, reject) => {
        const cleanup = [];
        const onError = (err) => {
            reject(err);
        };
        Promise.race([
            new Promise((_, rej) => {
                cancelSignal === null || cancelSignal === void 0 ? void 0 : cancelSignal(() => {
                    rej(new Error(make_cancel_signal_1.cancelErrorMessages.renderFrames));
                });
            }),
            Promise.all([
                (0, prepare_server_1.makeOrReuseServer)(server, {
                    webpackConfigOrServeUrl: webpackBundleOrServeUrl,
                    port,
                    remotionRoot: (0, find_closest_package_json_1.findRemotionRoot)(),
                    offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : offthreadvideo_threads_1.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
                    logLevel,
                    indent,
                    offthreadVideoCacheSizeInBytes,
                    binariesDirectory,
                    forceIPv4: false,
                }, {
                    onDownload,
                }),
                browserInstance,
            ]).then(([{ server: openedServer, cleanupServer }, pInstance]) => {
                var _a;
                const { serveUrl, offthreadPort, sourceMap, downloadMap } = openedServer;
                const browserReplacer = (0, replace_browser_1.handleBrowserCrash)(pInstance, logLevel, indent);
                const cycle = (0, cycle_browser_tabs_1.cycleBrowserTabs)({
                    puppeteerInstance: browserReplacer,
                    concurrency: resolvedConcurrency,
                    logLevel,
                    indent,
                });
                cleanup.push(() => {
                    cycle.stopCycling();
                    return Promise.resolve();
                });
                cleanup.push(() => cleanupServer(false));
                return innerRenderFrames({
                    onError,
                    pagesArray: openedPages,
                    serveUrl,
                    composition,
                    resolvedConcurrency,
                    onDownload,
                    proxyPort: offthreadPort,
                    makeBrowser,
                    browserReplacer,
                    sourceMapGetter: sourceMap,
                    downloadMap,
                    cancelSignal,
                    envVariables,
                    everyNthFrame,
                    frameRange,
                    imageFormat,
                    jpegQuality,
                    muted,
                    onBrowserLog,
                    onFrameBuffer,
                    onFrameUpdate,
                    onStart,
                    outputDir,
                    scale,
                    timeoutInMilliseconds,
                    logLevel,
                    indent,
                    serializedInputPropsWithCustomSchema,
                    serializedResolvedPropsWithCustomSchema,
                    parallelEncodingEnabled,
                    binariesDirectory,
                    forSeamlessAacConcatenation,
                    compositionStart,
                    onBrowserDownload,
                    onArtifact,
                    chromeMode,
                    offthreadVideoThreads,
                    imageSequencePattern,
                    mediaCacheSizeInBytes,
                    onLog,
                    darkMode: (_a = chromiumOptions.darkMode) !== null && _a !== void 0 ? _a : false,
                });
            }),
        ])
            .then((res) => {
            server === null || server === void 0 ? void 0 : server.compositor.executeCommand('CloseAllVideos', {}).then(() => {
                logger_1.Log.verbose({ indent, logLevel, tag: 'compositor' }, 'Freed memory from compositor');
            }).catch((err) => {
                logger_1.Log.verbose({ indent, logLevel }, 'Could not close compositor', err);
            });
            return resolve(res);
        })
            .catch((err) => reject(err))
            .finally(() => {
            // If browser instance was passed in, we close all the pages
            // we opened.
            // If new browser was opened, then closing the browser as a cleanup.
            if (puppeteerInstance) {
                Promise.all(openedPages.map((p) => p.close())).catch((err) => {
                    if ((0, flaky_errors_1.isTargetClosedErr)(err)) {
                        return;
                    }
                    logger_1.Log.error({ indent, logLevel }, 'Unable to close browser tab', err);
                });
            }
            else {
                Promise.resolve(browserInstance)
                    .then((instance) => {
                    return instance.close({ silent: true });
                })
                    .catch((err) => {
                    if (!(err === null || err === void 0 ? void 0 : err.message.includes('Target closed'))) {
                        logger_1.Log.error({ indent, logLevel }, 'Unable to close browser', err);
                    }
                });
            }
            cleanup.forEach((c) => {
                c();
            });
            // Don't clear download dir because it might be used by stitchFramesToVideo
        });
    });
};
exports.internalRenderFrames = (0, wrap_with_error_handling_1.wrapWithErrorHandling)(internalRenderFramesRaw);
/*
 * @description Renders a series of images using Puppeteer and computes information for mixing audio.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-frames)
 */
const renderFrames = (options) => {
    const { composition, inputProps, onFrameUpdate, onStart, outputDir, serveUrl, browserExecutable, cancelSignal, chromiumOptions, concurrency, dumpBrowserLogs, envVariables, everyNthFrame, frameRange, imageFormat, jpegQuality, muted, onBrowserLog, onDownload, onFrameBuffer, port, puppeteerInstance, scale, timeoutInMilliseconds, verbose, quality, logLevel: passedLogLevel, offthreadVideoCacheSizeInBytes, binariesDirectory, onBrowserDownload, onArtifact, chromeMode, offthreadVideoThreads, imageSequencePattern, mediaCacheSizeInBytes, } = options;
    if (!composition) {
        throw new Error('No `composition` option has been specified for renderFrames()');
    }
    if (typeof jpegQuality !== 'undefined' && imageFormat !== 'jpeg') {
        throw new Error("You can only pass the `quality` option if `imageFormat` is 'jpeg'.");
    }
    const logLevel = verbose || dumpBrowserLogs ? 'verbose' : (passedLogLevel !== null && passedLogLevel !== void 0 ? passedLogLevel : 'info');
    const indent = false;
    if (quality) {
        logger_1.Log.warn({ indent, logLevel }, 'Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.');
    }
    return (0, exports.internalRenderFrames)({
        browserExecutable: browserExecutable !== null && browserExecutable !== void 0 ? browserExecutable : null,
        cancelSignal,
        chromiumOptions: chromiumOptions !== null && chromiumOptions !== void 0 ? chromiumOptions : {},
        composition,
        concurrency: concurrency !== null && concurrency !== void 0 ? concurrency : null,
        envVariables: envVariables !== null && envVariables !== void 0 ? envVariables : {},
        everyNthFrame: everyNthFrame !== null && everyNthFrame !== void 0 ? everyNthFrame : 1,
        frameRange: frameRange !== null && frameRange !== void 0 ? frameRange : null,
        imageFormat: imageFormat !== null && imageFormat !== void 0 ? imageFormat : 'jpeg',
        indent,
        jpegQuality: jpegQuality !== null && jpegQuality !== void 0 ? jpegQuality : jpeg_quality_1.DEFAULT_JPEG_QUALITY,
        onDownload: onDownload !== null && onDownload !== void 0 ? onDownload : null,
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            indent: undefined,
            staticBase: null,
            data: inputProps !== null && inputProps !== void 0 ? inputProps : {},
        }).serializedString,
        serializedResolvedPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            indent: undefined,
            staticBase: null,
            data: composition.props,
        }).serializedString,
        puppeteerInstance,
        muted: muted !== null && muted !== void 0 ? muted : false,
        onBrowserLog: onBrowserLog !== null && onBrowserLog !== void 0 ? onBrowserLog : null,
        onFrameBuffer: onFrameBuffer !== null && onFrameBuffer !== void 0 ? onFrameBuffer : null,
        onFrameUpdate,
        onStart,
        outputDir,
        port: port !== null && port !== void 0 ? port : null,
        scale: scale !== null && scale !== void 0 ? scale : 1,
        logLevel,
        timeoutInMilliseconds: timeoutInMilliseconds !== null && timeoutInMilliseconds !== void 0 ? timeoutInMilliseconds : TimeoutSettings_1.DEFAULT_TIMEOUT,
        webpackBundleOrServeUrl: serveUrl,
        server: undefined,
        offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes !== null && offthreadVideoCacheSizeInBytes !== void 0 ? offthreadVideoCacheSizeInBytes : null,
        parallelEncodingEnabled: false,
        binariesDirectory: binariesDirectory !== null && binariesDirectory !== void 0 ? binariesDirectory : null,
        compositionStart: 0,
        forSeamlessAacConcatenation: false,
        onBrowserDownload: onBrowserDownload !== null && onBrowserDownload !== void 0 ? onBrowserDownload : (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({ indent, logLevel, api: 'renderFrames()' }),
        onArtifact: onArtifact !== null && onArtifact !== void 0 ? onArtifact : null,
        chromeMode: chromeMode !== null && chromeMode !== void 0 ? chromeMode : 'headless-shell',
        offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : null,
        imageSequencePattern: imageSequencePattern !== null && imageSequencePattern !== void 0 ? imageSequencePattern : null,
        mediaCacheSizeInBytes: mediaCacheSizeInBytes !== null && mediaCacheSizeInBytes !== void 0 ? mediaCacheSizeInBytes : null,
        onLog: default_on_log_1.defaultOnLog,
    });
};
exports.renderFrames = renderFrames;
