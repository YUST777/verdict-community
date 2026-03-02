"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderStill = exports.internalRenderStill = void 0;
const node_fs_1 = __importStar(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const licensing_1 = require("@remotion/licensing");
const no_react_1 = require("remotion/no-react");
const browser_1 = require("./browser");
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const TimeoutSettings_1 = require("./browser/TimeoutSettings");
const collect_assets_1 = require("./collect-assets");
const convert_to_positive_frame_index_1 = require("./convert-to-positive-frame-index");
const default_on_log_1 = require("./default-on-log");
const ensure_output_directory_1 = require("./ensure-output-directory");
const handle_javascript_exception_1 = require("./error-handling/handle-javascript-exception");
const filter_asset_types_1 = require("./filter-asset-types");
const find_closest_package_json_1 = require("./find-closest-package-json");
const image_format_1 = require("./image-format");
const jpeg_quality_1 = require("./jpeg-quality");
const logger_1 = require("./logger");
const make_cancel_signal_1 = require("./make-cancel-signal");
const get_available_memory_1 = require("./memory/get-available-memory");
const mime_types_1 = require("./mime-types");
const open_browser_1 = require("./open-browser");
const overwrite_1 = require("./overwrite");
const prepare_server_1 = require("./prepare-server");
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const seek_to_frame_1 = require("./seek-to-frame");
const set_props_and_env_1 = require("./set-props-and-env");
const take_frame_1 = require("./take-frame");
const validate_1 = require("./validate");
const validate_puppeteer_timeout_1 = require("./validate-puppeteer-timeout");
const validate_scale_1 = require("./validate-scale");
const wrap_with_error_handling_1 = require("./wrap-with-error-handling");
const innerRenderStill = async ({ composition, imageFormat = image_format_1.DEFAULT_STILL_IMAGE_FORMAT, serveUrl, puppeteerInstance, onError, serializedInputPropsWithCustomSchema, envVariables, output, frame = 0, overwrite, browserExecutable, timeoutInMilliseconds, chromiumOptions, scale, proxyPort, cancelSignal, jpegQuality, onBrowserLog, sourceMapGetter, logLevel, indent, serializedResolvedPropsWithCustomSchema, onBrowserDownload, onArtifact, chromeMode, mediaCacheSizeInBytes, onLog, }) => {
    var _a;
    (0, validate_1.validateDimension)(composition.height, 'height', 'in the `config` object passed to `renderStill()`');
    (0, validate_1.validateDimension)(composition.width, 'width', 'in the `config` object passed to `renderStill()`');
    (0, validate_1.validateFps)(composition.fps, 'in the `config` object of `renderStill()`', false);
    (0, validate_1.validateDurationInFrames)(composition.durationInFrames, {
        component: 'in the `config` object passed to `renderStill()`',
        allowFloats: false,
    });
    (0, image_format_1.validateStillImageFormat)(imageFormat);
    no_react_1.NoReactInternals.validateFrame({
        frame,
        durationInFrames: composition.durationInFrames,
        allowFloats: false,
    });
    const stillFrame = (0, convert_to_positive_frame_index_1.convertToPositiveFrameIndex)({
        durationInFrames: composition.durationInFrames,
        frame,
    });
    (0, validate_puppeteer_timeout_1.validatePuppeteerTimeout)(timeoutInMilliseconds);
    (0, validate_scale_1.validateScale)(scale);
    output =
        typeof output === 'string' ? node_path_1.default.resolve(process.cwd(), output) : null;
    (0, jpeg_quality_1.validateJpegQuality)(jpegQuality);
    if (output) {
        if (node_fs_1.default.existsSync(output)) {
            if (!overwrite) {
                throw new Error(`Cannot render still - "overwrite" option was set to false, but the output destination ${output} already exists.`);
            }
            const stat = (0, node_fs_1.statSync)(output);
            if (!stat.isFile()) {
                throw new Error(`The output location ${output} already exists, but is not a file, but something else (e.g. folder). Cannot save to it.`);
            }
        }
        (0, ensure_output_directory_1.ensureOutputDirectory)(output);
    }
    const browserInstance = puppeteerInstance !== null && puppeteerInstance !== void 0 ? puppeteerInstance : (await (0, open_browser_1.internalOpenBrowser)({
        browser: browser_1.DEFAULT_BROWSER,
        browserExecutable,
        chromiumOptions,
        forceDeviceScaleFactor: scale,
        indent,
        viewport: null,
        logLevel,
        onBrowserDownload,
        chromeMode,
    }));
    const page = await browserInstance.newPage({
        context: sourceMapGetter,
        logLevel,
        indent,
        pageIndex: 0,
        onBrowserLog,
        onLog,
    });
    await page.setViewport({
        width: composition.width,
        height: composition.height,
        deviceScaleFactor: scale,
    });
    const errorCallback = (err) => {
        onError(err);
        cleanup();
    };
    const cleanUpJSException = (0, handle_javascript_exception_1.handleJavascriptException)({
        page,
        onError: errorCallback,
        frame: null,
    });
    const cleanup = async () => {
        cleanUpJSException();
        if (puppeteerInstance) {
            await page.close();
        }
        else {
            browserInstance.close({ silent: true }).catch((err) => {
                logger_1.Log.error({ indent, logLevel }, 'Unable to close browser', err);
            });
        }
    };
    cancelSignal === null || cancelSignal === void 0 ? void 0 : cancelSignal(() => {
        cleanup();
    });
    await (0, set_props_and_env_1.setPropsAndEnv)({
        serializedInputPropsWithCustomSchema,
        envVariables,
        page,
        serveUrl,
        initialFrame: stillFrame,
        timeoutInMilliseconds,
        proxyPort,
        retriesRemaining: 2,
        audioEnabled: false,
        videoEnabled: true,
        indent,
        logLevel,
        onServeUrlVisited: () => undefined,
        isMainTab: true,
        mediaCacheSizeInBytes,
        initialMemoryAvailable: (0, get_available_memory_1.getAvailableMemory)(logLevel),
        darkMode: (_a = chromiumOptions.darkMode) !== null && _a !== void 0 ? _a : false,
    });
    await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
        // eslint-disable-next-line max-params
        pageFunction: (id, props, durationInFrames, fps, height, width, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat, defaultProResProfile) => {
            window.remotion_setBundleMode({
                type: 'composition',
                compositionName: id,
                serializedResolvedPropsWithSchema: props,
                compositionDurationInFrames: durationInFrames,
                compositionFps: fps,
                compositionHeight: height,
                compositionWidth: width,
                compositionDefaultCodec: defaultCodec,
                compositionDefaultOutName: defaultOutName,
                compositionDefaultVideoImageFormat: defaultVideoImageFormat,
                compositionDefaultPixelFormat: defaultPixelFormat,
                compositionDefaultProResProfile: defaultProResProfile,
            });
        },
        args: [
            composition.id,
            serializedResolvedPropsWithCustomSchema,
            composition.durationInFrames,
            composition.fps,
            composition.height,
            composition.width,
            composition.defaultCodec,
            composition.defaultOutName,
            composition.defaultVideoImageFormat,
            composition.defaultPixelFormat,
            composition.defaultProResProfile,
        ],
        frame: null,
        page,
        timeoutInMilliseconds,
    });
    await (0, seek_to_frame_1.seekToFrame)({
        frame: stillFrame,
        page,
        composition: composition.id,
        timeoutInMilliseconds,
        indent,
        logLevel,
        attempt: 0,
    });
    const [buffer, collectedAssets] = await Promise.all([
        (0, take_frame_1.takeFrame)({
            freePage: page,
            height: composition.height,
            width: composition.width,
            imageFormat,
            scale,
            output,
            jpegQuality,
            wantsBuffer: !output,
            timeoutInMilliseconds,
        }),
        (0, collect_assets_1.collectAssets)({
            frame,
            freePage: page,
            timeoutInMilliseconds,
        }),
    ]);
    const artifactAssets = (0, filter_asset_types_1.onlyArtifact)({
        assets: collectedAssets,
        frameBuffer: buffer,
    });
    const previousArtifactAssets = [];
    for (const artifact of artifactAssets) {
        for (const previousArtifact of previousArtifactAssets) {
            if (artifact.filename === previousArtifact.filename) {
                throw new Error(`An artifact with output "${artifact.filename}" was already registered at frame ${previousArtifact.frame}, but now registered again at frame ${artifact.frame}. Artifacts must have unique names. https://remotion.dev/docs/artifacts`);
            }
        }
        previousArtifactAssets.push(artifact);
        onArtifact === null || onArtifact === void 0 ? void 0 : onArtifact(artifact);
    }
    await cleanup();
    return {
        buffer: output ? null : buffer,
        contentType: (0, mime_types_1.mimeLookup)('file.' + imageFormat) || 'application/octet-stream',
    };
};
const internalRenderStillRaw = (options) => {
    const cleanup = [];
    const happyPath = new Promise((resolve, reject) => {
        var _a;
        const onError = (err) => reject(err);
        (0, prepare_server_1.makeOrReuseServer)(options.server, {
            webpackConfigOrServeUrl: options.serveUrl,
            port: options.port,
            remotionRoot: (0, find_closest_package_json_1.findRemotionRoot)(),
            offthreadVideoThreads: (_a = options.offthreadVideoThreads) !== null && _a !== void 0 ? _a : 2,
            logLevel: options.logLevel,
            indent: options.indent,
            offthreadVideoCacheSizeInBytes: options.offthreadVideoCacheSizeInBytes,
            binariesDirectory: options.binariesDirectory,
            forceIPv4: false,
        }, {
            onDownload: options.onDownload,
        })
            .then(({ server, cleanupServer }) => {
            cleanup.push(() => cleanupServer(false));
            const { serveUrl, offthreadPort, sourceMap: sourceMapGetter } = server;
            return innerRenderStill({
                ...options,
                serveUrl,
                onError,
                proxyPort: offthreadPort,
                sourceMapGetter,
            });
        })
            .then((res) => {
            var _a;
            if (options.licenseKey === null) {
                resolve(res);
                return;
            }
            licensing_1.LicensingInternals.internalRegisterUsageEvent({
                licenseKey: options.licenseKey,
                event: 'cloud-render',
                host: null,
                succeeded: true,
                isStill: true,
                isProduction: (_a = options.isProduction) !== null && _a !== void 0 ? _a : true,
            })
                .then(() => {
                logger_1.Log.verbose(options, 'Usage event sent successfully');
            })
                .catch((err) => {
                logger_1.Log.error(options, 'Failed to send usage event');
                logger_1.Log.error(options, err);
            })
                .finally(() => {
                resolve(res);
            });
        })
            .catch((err) => reject(err))
            .finally(() => {
            cleanup.forEach((c) => {
                c().catch((err) => {
                    logger_1.Log.error(options, 'Cleanup error:', err);
                });
            });
        });
    });
    return Promise.race([
        happyPath,
        new Promise((_resolve, reject) => {
            var _a;
            (_a = options.cancelSignal) === null || _a === void 0 ? void 0 : _a.call(options, () => {
                reject(new Error(make_cancel_signal_1.cancelErrorMessages.renderStill));
            });
        }),
    ]);
};
exports.internalRenderStill = (0, wrap_with_error_handling_1.wrapWithErrorHandling)(internalRenderStillRaw);
/*
 * @description Renders a single frame to an image and writes it to the specified output location.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/render-still)
 */
const renderStill = (options) => {
    var _a, _b, _c;
    const { composition, serveUrl, browserExecutable, cancelSignal, chromiumOptions, dumpBrowserLogs, envVariables, frame, imageFormat, inputProps, jpegQuality, onBrowserLog, onDownload, output, overwrite, port, puppeteerInstance, scale, timeoutInMilliseconds, verbose, quality, offthreadVideoCacheSizeInBytes, logLevel: passedLogLevel, binariesDirectory, onBrowserDownload, onArtifact, chromeMode, offthreadVideoThreads, mediaCacheSizeInBytes, apiKey, licenseKey, isProduction, } = options;
    if (typeof jpegQuality !== 'undefined' && imageFormat !== 'jpeg') {
        throw new Error("You can only pass the `quality` option if `imageFormat` is 'jpeg'.");
    }
    const indent = false;
    const logLevel = passedLogLevel !== null && passedLogLevel !== void 0 ? passedLogLevel : (verbose || dumpBrowserLogs ? 'verbose' : 'info');
    if (quality) {
        logger_1.Log.warn({ indent, logLevel }, 'Passing `quality()` to `renderStill` is deprecated. Use `jpegQuality` instead.');
    }
    return (0, exports.internalRenderStill)({
        composition,
        browserExecutable: browserExecutable !== null && browserExecutable !== void 0 ? browserExecutable : null,
        cancelSignal: cancelSignal !== null && cancelSignal !== void 0 ? cancelSignal : null,
        chromiumOptions: chromiumOptions !== null && chromiumOptions !== void 0 ? chromiumOptions : {},
        envVariables: envVariables !== null && envVariables !== void 0 ? envVariables : {},
        frame: frame !== null && frame !== void 0 ? frame : 0,
        imageFormat: imageFormat !== null && imageFormat !== void 0 ? imageFormat : image_format_1.DEFAULT_STILL_IMAGE_FORMAT,
        indent,
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            staticBase: null,
            indent: undefined,
            data: inputProps !== null && inputProps !== void 0 ? inputProps : {},
        }).serializedString,
        jpegQuality: (_a = jpegQuality !== null && jpegQuality !== void 0 ? jpegQuality : quality) !== null && _a !== void 0 ? _a : jpeg_quality_1.DEFAULT_JPEG_QUALITY,
        onBrowserLog: onBrowserLog !== null && onBrowserLog !== void 0 ? onBrowserLog : null,
        onDownload: onDownload !== null && onDownload !== void 0 ? onDownload : null,
        output: output !== null && output !== void 0 ? output : null,
        overwrite: overwrite !== null && overwrite !== void 0 ? overwrite : overwrite_1.DEFAULT_OVERWRITE,
        port: port !== null && port !== void 0 ? port : null,
        puppeteerInstance: puppeteerInstance !== null && puppeteerInstance !== void 0 ? puppeteerInstance : null,
        scale: scale !== null && scale !== void 0 ? scale : 1,
        server: undefined,
        serveUrl,
        timeoutInMilliseconds: timeoutInMilliseconds !== null && timeoutInMilliseconds !== void 0 ? timeoutInMilliseconds : TimeoutSettings_1.DEFAULT_TIMEOUT,
        logLevel,
        serializedResolvedPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            indent: undefined,
            staticBase: null,
            data: (_b = composition.props) !== null && _b !== void 0 ? _b : {},
        }).serializedString,
        offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes !== null && offthreadVideoCacheSizeInBytes !== void 0 ? offthreadVideoCacheSizeInBytes : null,
        binariesDirectory: binariesDirectory !== null && binariesDirectory !== void 0 ? binariesDirectory : null,
        onBrowserDownload: onBrowserDownload !== null && onBrowserDownload !== void 0 ? onBrowserDownload : (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({
            indent,
            logLevel,
            api: 'renderStill()',
        }),
        onArtifact: onArtifact !== null && onArtifact !== void 0 ? onArtifact : null,
        chromeMode: chromeMode !== null && chromeMode !== void 0 ? chromeMode : 'headless-shell',
        offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : null,
        mediaCacheSizeInBytes: mediaCacheSizeInBytes !== null && mediaCacheSizeInBytes !== void 0 ? mediaCacheSizeInBytes : null,
        licenseKey: (_c = licenseKey !== null && licenseKey !== void 0 ? licenseKey : apiKey) !== null && _c !== void 0 ? _c : null,
        onLog: default_on_log_1.defaultOnLog,
        isProduction: isProduction !== null && isProduction !== void 0 ? isProduction : null,
    });
};
exports.renderStill = renderStill;
