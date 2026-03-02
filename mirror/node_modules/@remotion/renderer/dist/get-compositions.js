"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompositions = exports.internalGetCompositions = void 0;
const no_react_1 = require("remotion/no-react");
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const TimeoutSettings_1 = require("./browser/TimeoutSettings");
const default_on_log_1 = require("./default-on-log");
const handle_javascript_exception_1 = require("./error-handling/handle-javascript-exception");
const find_closest_package_json_1 = require("./find-closest-package-json");
const get_browser_instance_1 = require("./get-browser-instance");
const get_available_memory_1 = require("./memory/get-available-memory");
const offthreadvideo_threads_1 = require("./options/offthreadvideo-threads");
const prepare_server_1 = require("./prepare-server");
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const seek_to_frame_1 = require("./seek-to-frame");
const set_props_and_env_1 = require("./set-props-and-env");
const validate_puppeteer_timeout_1 = require("./validate-puppeteer-timeout");
const wrap_with_error_handling_1 = require("./wrap-with-error-handling");
const innerGetCompositions = async ({ envVariables, serializedInputPropsWithCustomSchema, page, proxyPort, serveUrl, timeoutInMilliseconds, indent, logLevel, mediaCacheSizeInBytes, darkMode, }) => {
    (0, validate_puppeteer_timeout_1.validatePuppeteerTimeout)(timeoutInMilliseconds);
    await (0, set_props_and_env_1.setPropsAndEnv)({
        serializedInputPropsWithCustomSchema,
        envVariables,
        page,
        serveUrl,
        initialFrame: 0,
        timeoutInMilliseconds,
        proxyPort,
        retriesRemaining: 2,
        audioEnabled: false,
        videoEnabled: false,
        indent,
        logLevel,
        onServeUrlVisited: () => undefined,
        isMainTab: true,
        mediaCacheSizeInBytes,
        initialMemoryAvailable: (0, get_available_memory_1.getAvailableMemory)(logLevel),
        darkMode,
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
        indent,
        logLevel,
    });
    const { value: result } = await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
        pageFunction: () => {
            return window.getStaticCompositions();
        },
        frame: null,
        page,
        args: [],
        timeoutInMilliseconds,
    });
    const res = result;
    return res.map((r) => {
        const { width, durationInFrames, fps, height, id, defaultCodec, defaultOutName, defaultVideoImageFormat, defaultPixelFormat, defaultProResProfile, } = r;
        return {
            id,
            width,
            height,
            fps,
            durationInFrames,
            props: no_react_1.NoReactInternals.deserializeJSONWithSpecialTypes(r.serializedResolvedPropsWithCustomSchema),
            defaultProps: no_react_1.NoReactInternals.deserializeJSONWithSpecialTypes(r.serializedDefaultPropsWithCustomSchema),
            defaultCodec,
            defaultOutName,
            defaultVideoImageFormat,
            defaultPixelFormat,
            defaultProResProfile,
        };
    });
};
const internalGetCompositionsRaw = async ({ browserExecutable, chromiumOptions, envVariables, indent, serializedInputPropsWithCustomSchema, onBrowserLog, port, puppeteerInstance, serveUrlOrWebpackUrl, server, timeoutInMilliseconds, logLevel, offthreadVideoCacheSizeInBytes, binariesDirectory, onBrowserDownload, chromeMode, offthreadVideoThreads, mediaCacheSizeInBytes, onLog, }) => {
    const { page, cleanupPage } = await (0, get_browser_instance_1.getPageAndCleanupFn)({
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
        onLog,
    });
    const cleanup = [cleanupPage];
    return new Promise((resolve, reject) => {
        const onError = (err) => reject(err);
        cleanup.push((0, handle_javascript_exception_1.handleJavascriptException)({
            page,
            frame: null,
            onError,
        }));
        (0, prepare_server_1.makeOrReuseServer)(server, {
            webpackConfigOrServeUrl: serveUrlOrWebpackUrl,
            port,
            remotionRoot: (0, find_closest_package_json_1.findRemotionRoot)(),
            offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : offthreadvideo_threads_1.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS,
            logLevel,
            indent,
            offthreadVideoCacheSizeInBytes,
            binariesDirectory,
            forceIPv4: false,
        }, {
            onDownload: () => undefined,
        })
            .then(({ server: { serveUrl, offthreadPort, sourceMap }, cleanupServer }) => {
            var _a;
            page.setBrowserSourceMapGetter(sourceMap);
            cleanup.push(() => {
                return cleanupServer(true);
            });
            return innerGetCompositions({
                envVariables,
                serializedInputPropsWithCustomSchema,
                page,
                proxyPort: offthreadPort,
                serveUrl,
                timeoutInMilliseconds,
                indent,
                logLevel,
                offthreadVideoCacheSizeInBytes,
                binariesDirectory,
                onBrowserDownload,
                chromeMode,
                offthreadVideoThreads,
                mediaCacheSizeInBytes,
                darkMode: (_a = chromiumOptions.darkMode) !== null && _a !== void 0 ? _a : false,
            });
        })
            .then((comp) => {
            return resolve(comp);
        })
            .catch((err) => {
            reject(err);
        })
            .finally(() => {
            cleanup.forEach((c) => {
                c();
            });
        });
    });
};
exports.internalGetCompositions = (0, wrap_with_error_handling_1.wrapWithErrorHandling)(internalGetCompositionsRaw);
/*
 * @description Gets a list of compositions defined in a Remotion project based on a Remotion Bundle by evaluating the Remotion Root.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/get-compositions)
 */
const getCompositions = (serveUrlOrWebpackUrl, config) => {
    if (!serveUrlOrWebpackUrl) {
        throw new Error('No serve URL or webpack bundle directory was passed to getCompositions().');
    }
    const { browserExecutable, chromiumOptions, envVariables, inputProps, onBrowserLog, port, puppeteerInstance, timeoutInMilliseconds, logLevel: passedLogLevel, onBrowserDownload, binariesDirectory, offthreadVideoCacheSizeInBytes, chromeMode, offthreadVideoThreads, mediaCacheSizeInBytes, } = config !== null && config !== void 0 ? config : {};
    const indent = false;
    const logLevel = passedLogLevel !== null && passedLogLevel !== void 0 ? passedLogLevel : 'info';
    return (0, exports.internalGetCompositions)({
        browserExecutable: browserExecutable !== null && browserExecutable !== void 0 ? browserExecutable : null,
        chromiumOptions: chromiumOptions !== null && chromiumOptions !== void 0 ? chromiumOptions : {},
        envVariables: envVariables !== null && envVariables !== void 0 ? envVariables : {},
        serializedInputPropsWithCustomSchema: no_react_1.NoReactInternals.serializeJSONWithSpecialTypes({
            data: inputProps !== null && inputProps !== void 0 ? inputProps : {},
            indent: undefined,
            staticBase: null,
        }).serializedString,
        indent,
        onBrowserLog: onBrowserLog !== null && onBrowserLog !== void 0 ? onBrowserLog : null,
        port: port !== null && port !== void 0 ? port : null,
        puppeteerInstance: puppeteerInstance !== null && puppeteerInstance !== void 0 ? puppeteerInstance : undefined,
        serveUrlOrWebpackUrl,
        server: undefined,
        timeoutInMilliseconds: timeoutInMilliseconds !== null && timeoutInMilliseconds !== void 0 ? timeoutInMilliseconds : TimeoutSettings_1.DEFAULT_TIMEOUT,
        logLevel,
        offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes !== null && offthreadVideoCacheSizeInBytes !== void 0 ? offthreadVideoCacheSizeInBytes : null,
        binariesDirectory: binariesDirectory !== null && binariesDirectory !== void 0 ? binariesDirectory : null,
        onBrowserDownload: onBrowserDownload !== null && onBrowserDownload !== void 0 ? onBrowserDownload : (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({
            indent,
            logLevel,
            api: 'getCompositions()',
        }),
        chromeMode: chromeMode !== null && chromeMode !== void 0 ? chromeMode : 'headless-shell',
        offthreadVideoThreads: offthreadVideoThreads !== null && offthreadVideoThreads !== void 0 ? offthreadVideoThreads : null,
        mediaCacheSizeInBytes: mediaCacheSizeInBytes !== null && mediaCacheSizeInBytes !== void 0 ? mediaCacheSizeInBytes : null,
        onLog: default_on_log_1.defaultOnLog,
    });
};
exports.getCompositions = getCompositions;
