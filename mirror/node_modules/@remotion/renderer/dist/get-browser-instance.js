"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageAndCleanupFn = void 0;
const browser_1 = require("./browser");
const logger_1 = require("./logger");
const open_browser_1 = require("./open-browser");
const getPageAndCleanupFn = async ({ passedInInstance, browserExecutable, chromiumOptions, forceDeviceScaleFactor, indent, logLevel, onBrowserDownload, chromeMode, pageIndex, onBrowserLog, onLog, }) => {
    if (passedInInstance) {
        const page = await passedInInstance.newPage({
            context: () => null,
            logLevel,
            indent,
            pageIndex,
            onBrowserLog,
            onLog,
        });
        return {
            page,
            cleanupPage: () => {
                // Close puppeteer page and don't wait for it to finish.
                // Keep browser open.
                page.close().catch((err) => {
                    if (!err.message.includes('Target closed')) {
                        logger_1.Log.error({ indent, logLevel }, 'Was not able to close puppeteer page', err);
                    }
                });
                return Promise.resolve();
            },
        };
    }
    const browserInstance = await (0, open_browser_1.internalOpenBrowser)({
        browser: browser_1.DEFAULT_BROWSER,
        browserExecutable,
        chromiumOptions,
        forceDeviceScaleFactor,
        indent,
        viewport: null,
        logLevel,
        onBrowserDownload,
        chromeMode,
    });
    const browserPage = await browserInstance.newPage({
        context: () => null,
        logLevel,
        indent,
        pageIndex,
        onBrowserLog,
        onLog,
    });
    return {
        page: browserPage,
        cleanupPage: () => {
            // Close whole browser that was just created and don't wait for it to finish.
            browserInstance.close({ silent: true }).catch((err) => {
                if (!err.message.includes('Target closed')) {
                    logger_1.Log.error({ indent, logLevel }, 'Was not able to close puppeteer page', err);
                }
            });
            return Promise.resolve();
        },
    };
};
exports.getPageAndCleanupFn = getPageAndCleanupFn;
