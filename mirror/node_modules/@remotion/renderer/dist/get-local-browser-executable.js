"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalBrowserExecutable = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const BrowserFetcher_1 = require("./browser/BrowserFetcher");
const logger_1 = require("./logger");
const getBrowserStatus = ({ browserExecutablePath, indent, logLevel, chromeMode, }) => {
    if (browserExecutablePath) {
        if (!node_fs_1.default.existsSync(browserExecutablePath)) {
            logger_1.Log.warn({ indent, logLevel }, `Browser executable was specified as '${browserExecutablePath}' but the path doesn't exist.`);
        }
        return { path: browserExecutablePath, type: 'user-defined-path' };
    }
    const revision = (0, BrowserFetcher_1.getRevisionInfo)(chromeMode);
    if (revision.local && node_fs_1.default.existsSync(revision.executablePath)) {
        return { path: revision.executablePath, type: 'local-puppeteer-browser' };
    }
    return { type: 'no-browser' };
};
const getLocalBrowserExecutable = ({ preferredBrowserExecutable, logLevel, indent, chromeMode, }) => {
    const status = getBrowserStatus({
        browserExecutablePath: preferredBrowserExecutable,
        indent,
        logLevel,
        chromeMode,
    });
    if (status.type === 'no-browser' || status.type === 'version-mismatch') {
        throw new TypeError('No browser found for rendering frames! Please open a GitHub issue and describe ' +
            'how you reached this error: https://remotion.dev/issue');
    }
    return status.path;
};
exports.getLocalBrowserExecutable = getLocalBrowserExecutable;
