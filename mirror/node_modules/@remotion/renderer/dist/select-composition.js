"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectComposition = exports.internalSelectComposition = exports.internalSelectCompositionRaw = void 0;
const no_react_1 = require("remotion/no-react");
const _1 = require(".");
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const TimeoutSettings_1 = require("./browser/TimeoutSettings");
const handle_javascript_exception_1 = require("./error-handling/handle-javascript-exception");
const find_closest_package_json_1 = require("./find-closest-package-json");
const get_browser_instance_1 = require("./get-browser-instance");
const logger_1 = require("./logger");
const get_available_memory_1 = require("./memory/get-available-memory");
const prepare_server_1 = require("./prepare-server");
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const seek_to_frame_1 = require("./seek-to-frame");
const set_props_and_env_1 = require("./set-props-and-env");
const validate_puppeteer_timeout_1 = require("./validate-puppeteer-timeout");
const wrap_with_error_handling_1 = require("./wrap-with-error-handling");
const innerSelectComposition = async ({ page, serializedInputPropsWithCustomSchema, envVariables, serveUrl, timeoutInMilliseconds, port, id, indent, logLevel, onServeUrlVisited, mediaCacheSizeInBytes, chromiumOptions, }) => {
    var _a;
    (0, validate_puppeteer_timeout_1.validatePuppeteerTimeout)(timeoutInMilliseconds);
    await (0, set_props_and_env_1.setPropsAndEnv)({
        serializedInputPropsWithCustomSchema,
        envVariables,
        page,
        serveUrl,
        initialFrame: 0,
        timeoutInMilliseconds,
        proxyPort: port,
        retriesRemaining: 2,
        audioEnabled: false,
        videoEnabled: false,
        indent,
        logLevel,
        onServeUrlVisited,
        isMainTab: true,
        mediaCacheSizeInBytes,
        initialMemoryAvailable: (0, get_available_memory_1.getAvailableMemory)(logLevel),
        darkMode: (_a = chromiumOptions.darkMode) !== null && _a !== void 0 ? _a : false,
    });
    await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
        page,
        pageFunction: () => {
            window.remotion_setBundleMode({
                type: 'evaluation',
            });
        },
        frame: null,
        args: [],
        timeoutInMilliseconds,
    });
    await (0, seek_to_frame_1.waitForReady)({
        page,
        timeoutInMilliseconds,
        frame: null,
        logLevel,
        indent,
    });
    logger_1.Log.verbose({
        indent,
        tag: 'selectComposition()',
        logLevel,
    }, 'Running calculateMetadata()...');
    const time = Date.now();
    const { value: result, size } = await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
        pageFunction: (_id) => {
            return window.remotion_calculateComposition(_id);
        },
        frame: null,
        page,
        args: [id],
        timeoutInMilliseconds,
    });
    logger_1.Log.verbose({
        indent,
        tag: 'selectComposition()',
        logLevel,
    }, `calculateMetadata() took ${Date.now() - time}ms`);
    const res = result;
    const { width, durationInFrames, fps, height, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat, defaultProResProfile, } = res;
    return {
        metadata: {
            id,
            width,
            height,
            fps,
            durationInFrames,
            props: no_react_1.NoReactInternals.deserializeJSONWithSpecialTypes(res.serializedResolvedPropsWithCustomSchema),
            defaultProps: no_react_1.NoReactInternals.deserializeJSONWithSpecialTypes(res.serializedDefaultPropsWithCustomSchema),
            defaultCodec,
            defaultOutName,
            defaultVideoImageFormat,
            defaultPixelFormat,
            defaultProResProfile,
        },
        propsSize: size,
    };
};
const internalSelectCompositionRaw = async (options) => {
    const cleanup = [];
    const { puppeteerInstance, browserExecutable, chromiumOptions, serveUrl: serveUrlOrWebpackUrl, logLevel, indent, port, envVariables, id, serializedInputPropsWithCustomSchema, onBrowserLog, server, timeoutInMilliseconds, offthreadVideoCacheSizeInBytes, binariesDirectory, onBrowserDownload, onServeUrlVisited, chromeMode, mediaCacheSizeInBytes, } = options;
    const [{ page, cleanupPage }, serverUsed] = await Promise.all([
        (0, get_browser_instance_1.getPageAndCleanupFn)({
            passedInInstance: puppeteerInstance,
            browserExecutable,
            chromiumOptions,
            forceDeviceScaleFactor: undefined,
            indent,
            logLevel,
            onBrowserDownload,
            chromeMode,
            pageIndex: 0,
            onBrowserLog,
            onLog: _1.RenderInternals.defaultOnLog,
        }),
        (0, prepare_server_1.makeOrReuseServer)(options.server, {
            webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
            port,
            remotionRoot: (0, find_closest_package_json_1.findRemotionRoot)(),
            offthreadVideoThreads: 0,
            logLevel,
            indent,
            offthreadVideoCacheSizeInBytes,
            binariesDirectory,
            forceIPv4: false,
        }, {
            onDownload: () => undefined,
        }).then((result) => {
            cleanup.push(() => result.cleanupServer(true));
            return result;
        }),
    ]);
    cleanup.push(() => cleanupPage());
    return new Promise((resolve, reject) => {
        const onError = (err) => reject(err);
        cleanup.push((0, handle_javascript_exception_1.handleJavascriptException)({
            page,
            frame: null,
            onError,
        }));
        page.setBrowserSourceMapGetter(serverUsed.server.sourceMap);
        innerSelectComposition({
            serveUrl: serverUsed.server.serveUrl,
            page,
            port: serverUsed.server.offthreadPort,
            browserExecutable,
            chromiumOptions,
            envVariables,
            id,
            serializedInputPropsWithCustomSchema,
            timeoutInMilliseconds,
            logLevel,
            indent,
            puppeteerInstance,
            server,
            offthreadVideoCacheSizeInBytes,
            binariesDirectory,
            onBrowserDownload,
            onServeUrlVisited,
            chromeMode,
            mediaCacheSizeInBytes,
        })
            .then((data) => {
            return resolve(data);
        })
            .catch((err) => {
            reject(err);
        })
            .finally(() => {
            cleanup.forEach((c) => {
                // Must prevent unhandled exception in cleanup function.
                // Promise has already been resolved, so we can't reject it.
                c().catch((err) => {
                    logger_1.Log.error({ indent, logLevel }, 'Cleanup error:', err);
                });
            });
        });
    });
};
exports.internalSelectCompositionRaw = internalSelectCompositionRaw;
exports.internalSelectComposition = (0, wrap_with_error_handling_1.wrapWithErrorHandling)(exports.internalSelectCompositionRaw);
/*
 * @description Evaluates the list of compositions from a Remotion Bundle by evaluating the Remotion Root and evaluating `calculateMetadata()` on the specified composition.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/select-composition)
 */
const selectComposition = async (options) => {
    const { id, serveUrl, browserExecutable, chromiumOptions, envVariables, inputProps, onBrowserLog, port, puppeteerInstance, timeoutInMilliseconds, verbose, logLevel: passedLogLevel, offthreadVideoCacheSizeInBytes, binariesDirectory, onBrowserDownload, chromeMode, offthreadVideoThreads, mediaCacheSizeInBytes, } = options;
    const indent = false;
    const logLevel = passedLogLevel !== null && passedLogLevel !== void 0 ? passedLogLevel : (verbose ? 'verbose' : 'info');
    const data = await (0, exports.internalSelectComposition)({
        id,
        serveUrl,
        browserExecutable: browserExecutable !== null && browserExecutable !== void 0 ? browserExecutable : null,
        chromiumOptions: chromiumOptions !== null && chromiumOptions !== void 0 ? chromiumOptions : {},
        envVariables: envVariables !== null && envVariables !== void 0 ? envVariables : {},
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            indent: undefined,
            staticBase: null,
            data: inputProps !== null && inputProps !== void 0 ? inputProps : {},
        }).serializedString,
        onBrowserLog: onBrowserLog !== null && onBrowserLog !== void 0 ? onBrowserLog : null,
        port: port !== null && port !== void 0 ? port : null,
        puppeteerInstance,
        timeoutInMilliseconds: timeoutInMilliseconds !== null && timeoutInMilliseconds !== void 0 ? timeoutInMilliseconds : TimeoutSettings_1.DEFAULT_TIMEOUT,
        logLevel,
        indent,
        server: undefined,
        offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes !== null && offthreadVideoCacheSizeInBytes !== void 0 ? offthreadVideoCacheSizeInBytes : null,
        binariesDirectory: binariesDirectory !== null && binariesDirectory !== void 0 ? binariesDirectory : null,
        onBrowserDownload: onBrowserDownload !== null && onBrowserDownload !== void 0 ? onBrowserDownload : (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({
            indent,
            logLevel,
            api: 'selectComposition()',
        }),
        onServeUrlVisited: () => undefined,
        chromeMode: chromeMode !== null && chromeMode !== void 0 ? chromeMode : 'headless-shell',
        offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : null,
        mediaCacheSizeInBytes: mediaCacheSizeInBytes !== null && mediaCacheSizeInBytes !== void 0 ? mediaCacheSizeInBytes : null,
    });
    return data.metadata;
};
exports.selectComposition = selectComposition;
