"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePage = void 0;
const get_available_memory_1 = require("./memory/get-available-memory");
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const set_props_and_env_1 = require("./set-props-and-env");
const makePage = async ({ context, initialFrame, browserReplacer, logLevel, indent, pagesArray, onBrowserLog, scale, timeoutInMilliseconds, composition, proxyPort, serveUrl, muted, envVariables, serializedInputPropsWithCustomSchema, imageFormat, serializedResolvedPropsWithCustomSchema, pageIndex, isMainTab, mediaCacheSizeInBytes, onLog, darkMode, }) => {
    const page = await browserReplacer
        .getBrowser()
        .newPage({ context, logLevel, indent, pageIndex, onBrowserLog, onLog });
    pagesArray.push(page);
    await page.setViewport({
        width: composition.width,
        height: composition.height,
        deviceScaleFactor: scale,
    });
    await (0, set_props_and_env_1.setPropsAndEnv)({
        serializedInputPropsWithCustomSchema,
        envVariables,
        page,
        serveUrl,
        initialFrame,
        timeoutInMilliseconds,
        proxyPort,
        retriesRemaining: 2,
        audioEnabled: !muted,
        videoEnabled: imageFormat !== 'none',
        indent,
        logLevel,
        onServeUrlVisited: () => undefined,
        isMainTab,
        mediaCacheSizeInBytes,
        initialMemoryAvailable: (0, get_available_memory_1.getAvailableMemory)(logLevel),
        darkMode,
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
    return page;
};
exports.makePage = makePage;
