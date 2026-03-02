"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultBrowserDownloadProgress = void 0;
const logger_1 = require("../logger");
const to_megabytes_1 = require("../to-megabytes");
const defaultBrowserDownloadProgress = ({ indent, logLevel, api, }) => ({ chromeMode }) => {
    if (chromeMode === 'chrome-for-testing') {
        logger_1.Log.info({ indent, logLevel }, 'Downloading Chrome for Testing https://www.remotion.dev/chrome-for-testing');
    }
    else {
        logger_1.Log.info({ indent, logLevel }, 'Downloading Chrome Headless Shell https://www.remotion.dev/chrome-headless-shell');
    }
    logger_1.Log.info({ indent, logLevel }, `Customize this behavior by adding a onBrowserDownload function to ${api}.`);
    let lastProgress = 0;
    return {
        onProgress: (progress) => {
            if (progress.downloadedBytes > lastProgress + 10000000 ||
                progress.percent === 1) {
                lastProgress = progress.downloadedBytes;
                if (chromeMode === 'chrome-for-testing') {
                    logger_1.Log.info({ indent, logLevel }, `Downloading Chrome for Testing - ${(0, to_megabytes_1.toMegabytes)(progress.downloadedBytes)}/${(0, to_megabytes_1.toMegabytes)(progress.totalSizeInBytes)}`);
                }
                else {
                    logger_1.Log.info({ indent, logLevel }, `Downloading Chrome Headless Shell - ${(0, to_megabytes_1.toMegabytes)(progress.downloadedBytes)}/${(0, to_megabytes_1.toMegabytes)(progress.totalSizeInBytes)}`);
                }
            }
        },
        version: null,
    };
};
exports.defaultBrowserDownloadProgress = defaultBrowserDownloadProgress;
