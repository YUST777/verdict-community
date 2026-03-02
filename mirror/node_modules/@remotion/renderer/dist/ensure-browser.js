"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBrowser = exports.internalEnsureBrowser = void 0;
const fs_1 = __importDefault(require("fs"));
const browser_download_progress_bar_1 = require("./browser/browser-download-progress-bar");
const BrowserFetcher_1 = require("./browser/BrowserFetcher");
const logger_1 = require("./logger");
let currentEnsureBrowserOperation = Promise.resolve();
const internalEnsureBrowserUncapped = async ({ indent, logLevel, browserExecutable, onBrowserDownload, chromeMode, }) => {
    const status = getBrowserStatus({ browserExecutable, chromeMode });
    if (status.type === 'version-mismatch') {
        const versionInfo = status.actualVersion
            ? ` (installed: ${status.actualVersion})`
            : '';
        logger_1.Log.info({ indent, logLevel }, `This version of Remotion uses Chrome version ${BrowserFetcher_1.TESTED_VERSION}, but the installed one differs${versionInfo}. Re-downloading.`);
    }
    if (status.type === 'no-browser' || status.type === 'version-mismatch') {
        const { onProgress, version } = onBrowserDownload({ chromeMode });
        await (0, BrowserFetcher_1.downloadBrowser)({ indent, logLevel, onProgress, version, chromeMode });
    }
    const newStatus = getBrowserStatus({ browserExecutable, chromeMode });
    return newStatus;
};
const internalEnsureBrowser = (options) => {
    currentEnsureBrowserOperation = currentEnsureBrowserOperation.then(() => internalEnsureBrowserUncapped(options));
    return currentEnsureBrowserOperation;
};
exports.internalEnsureBrowser = internalEnsureBrowser;
const getBrowserStatus = ({ browserExecutable, chromeMode, }) => {
    if (browserExecutable) {
        if (!fs_1.default.existsSync(browserExecutable)) {
            throw new Error(`"browserExecutable" was specified as '${browserExecutable}' but the path doesn't exist. Pass "null" for "browserExecutable" to download a browser automatically.`);
        }
        return { path: browserExecutable, type: 'user-defined-path' };
    }
    const revision = (0, BrowserFetcher_1.getRevisionInfo)(chromeMode);
    if (revision.local && fs_1.default.existsSync(revision.executablePath)) {
        const actualVersion = (0, BrowserFetcher_1.readVersionFile)(chromeMode);
        if (actualVersion === BrowserFetcher_1.TESTED_VERSION) {
            return { path: revision.executablePath, type: 'local-puppeteer-browser' };
        }
        return { type: 'version-mismatch', actualVersion };
    }
    return { type: 'no-browser' };
};
/*
 * @description Ensures a browser is locally installed so a Remotion render can be executed.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/ensure-browser)
 */
const ensureBrowser = (options) => {
    var _a, _b, _c, _d, _e;
    const indent = false;
    const logLevel = (_a = options === null || options === void 0 ? void 0 : options.logLevel) !== null && _a !== void 0 ? _a : 'info';
    return (0, exports.internalEnsureBrowser)({
        browserExecutable: (_b = options === null || options === void 0 ? void 0 : options.browserExecutable) !== null && _b !== void 0 ? _b : null,
        indent,
        logLevel: (_c = options === null || options === void 0 ? void 0 : options.logLevel) !== null && _c !== void 0 ? _c : 'info',
        onBrowserDownload: (_d = options === null || options === void 0 ? void 0 : options.onBrowserDownload) !== null && _d !== void 0 ? _d : (0, browser_download_progress_bar_1.defaultBrowserDownloadProgress)({
            api: 'ensureBrowser()',
            indent: false,
            logLevel,
        }),
        chromeMode: (_e = options === null || options === void 0 ? void 0 : options.chromeMode) !== null && _e !== void 0 ? _e : 'headless-shell',
    });
};
exports.ensureBrowser = ensureBrowser;
