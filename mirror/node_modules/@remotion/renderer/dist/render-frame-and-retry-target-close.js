"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFrameAndRetryTargetClose = void 0;
const no_react_1 = require("remotion/no-react");
const flaky_errors_1 = require("./browser/flaky-errors");
const is_delay_render_error_with_retry_1 = require("./is-delay-render-error-with-retry");
const logger_1 = require("./logger");
const make_cancel_signal_1 = require("./make-cancel-signal");
const render_frame_1 = require("./render-frame");
const renderFrameAndRetryTargetClose = async ({ retriesLeft, attempt, assets, imageFormat, binariesDirectory, cancelSignal, composition, countType, downloadMap, frameDir, framesToRender, jpegQuality, onArtifact, onDownload, onError, outputDir, poolPromise, scale, stoppedSignal, timeoutInMilliseconds, indent, logLevel, makeBrowser, makeNewPage, browserReplacer, concurrencyOrFramesToRender, framesRenderedObj, lastFrame, onFrameBuffer, onFrameUpdate, nextFrameToRender, imageSequencePattern, trimLeftOffset, trimRightOffset, allFramesAndExtraFrames, }) => {
    var _a;
    const currentPool = await poolPromise;
    if (stoppedSignal.stopped) {
        return;
    }
    const freePage = await currentPool.acquire();
    const frame = nextFrameToRender.getNextFrame(freePage.pageIndex);
    try {
        await Promise.race([
            (0, render_frame_1.renderFrame)({
                trimLeftOffset,
                trimRightOffset,
                allFramesAndExtraFrames,
                attempt,
                assets,
                binariesDirectory,
                cancelSignal,
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
                scale,
                composition,
                framesRenderedObj,
                lastFrame,
                onError,
                onFrameBuffer,
                onFrameUpdate,
                outputDir,
                stoppedSignal,
                timeoutInMilliseconds,
                nextFrameToRender,
                frame,
                page: freePage,
                imageSequencePattern,
            }),
            new Promise((_, reject) => {
                cancelSignal === null || cancelSignal === void 0 ? void 0 : cancelSignal(() => {
                    reject(new Error(make_cancel_signal_1.cancelErrorMessages.renderFrames));
                });
            }),
        ]);
        currentPool.release(freePage);
    }
    catch (err) {
        const isTargetClosedError = (0, flaky_errors_1.isTargetClosedErr)(err);
        const shouldRetryError = (_a = err.stack) === null || _a === void 0 ? void 0 : _a.includes(no_react_1.NoReactInternals.DELAY_RENDER_RETRY_TOKEN);
        const flakyNetworkError = (0, flaky_errors_1.isFlakyNetworkError)(err);
        if ((0, make_cancel_signal_1.isUserCancelledRender)(err) && !shouldRetryError) {
            throw err;
        }
        if (!isTargetClosedError && !shouldRetryError && !flakyNetworkError) {
            throw err;
        }
        if (stoppedSignal.stopped) {
            return;
        }
        if (retriesLeft === 0) {
            logger_1.Log.warn({
                indent,
                logLevel,
            }, `The browser crashed ${attempt} times while rendering frame ${frame}. Not retrying anymore. Learn more about this error under https://www.remotion.dev/docs/target-closed`);
            throw err;
        }
        if (shouldRetryError) {
            const pool = await poolPromise;
            // Replace the closed page
            const newPage = await makeNewPage(frame, freePage.pageIndex);
            pool.release(newPage);
            logger_1.Log.warn({ indent, logLevel }, `delayRender() timed out while rendering frame ${frame}: ${err.message}`);
            const actualRetriesLeft = (0, is_delay_render_error_with_retry_1.getRetriesLeftFromError)(err);
            nextFrameToRender.returnFrame(frame);
            return (0, exports.renderFrameAndRetryTargetClose)({
                retriesLeft: actualRetriesLeft,
                attempt: attempt + 1,
                assets,
                imageFormat,
                binariesDirectory,
                cancelSignal,
                composition,
                countType,
                downloadMap,
                frameDir,
                framesToRender,
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
                makeNewPage,
                browserReplacer,
                concurrencyOrFramesToRender,
                framesRenderedObj,
                lastFrame,
                onFrameBuffer,
                onFrameUpdate,
                nextFrameToRender,
                imageSequencePattern,
                trimLeftOffset,
                trimRightOffset,
                allFramesAndExtraFrames,
            });
        }
        logger_1.Log.warn({ indent, logLevel }, `The browser crashed while rendering frame ${frame}, retrying ${retriesLeft} more times. Learn more about this error under https://www.remotion.dev/docs/target-closed`);
        // Replace the entire browser
        await browserReplacer.replaceBrowser(makeBrowser, async () => {
            const pages = new Array(concurrencyOrFramesToRender)
                .fill(true)
                .map((_, i) => makeNewPage(frame, i));
            const puppeteerPages = await Promise.all(pages);
            const pool = await poolPromise;
            for (const newPage of puppeteerPages) {
                pool.release(newPage);
            }
        });
        nextFrameToRender.returnFrame(frame);
        await (0, exports.renderFrameAndRetryTargetClose)({
            retriesLeft: retriesLeft - 1,
            attempt: attempt + 1,
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
            makeBrowser,
            onDownload,
            onError,
            outputDir,
            poolPromise,
            scale,
            stoppedSignal,
            timeoutInMilliseconds,
            browserReplacer,
            makeNewPage,
            concurrencyOrFramesToRender,
            framesRenderedObj,
            lastFrame,
            onFrameBuffer,
            onFrameUpdate,
            nextFrameToRender,
            imageSequencePattern,
            trimLeftOffset,
            trimRightOffset,
            allFramesAndExtraFrames,
        });
    }
};
exports.renderFrameAndRetryTargetClose = renderFrameAndRetryTargetClose;
