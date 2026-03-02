"use strict";
/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
exports.getRevisionInfo = exports.downloadBrowser = exports.readVersionFile = exports.TESTED_VERSION = void 0;
const fs = __importStar(require("node:fs"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const node_util_1 = require("node:util");
const extract_zip_1 = __importDefault(require("extract-zip"));
const download_file_1 = require("../assets/download-file");
const make_file_executable_1 = require("../compositor/make-file-executable");
const get_chrome_download_url_1 = require("./get-chrome-download-url");
Object.defineProperty(exports, "TESTED_VERSION", { enumerable: true, get: function () { return get_chrome_download_url_1.TESTED_VERSION; } });
const get_download_destination_1 = require("./get-download-destination");
const mkdirAsync = fs.promises.mkdir;
const unlinkAsync = (0, node_util_1.promisify)(fs.unlink.bind(fs));
function existsAsync(filePath) {
    return new Promise((resolve) => {
        fs.access(filePath, (err) => {
            return resolve(!err);
        });
    });
}
const getPlatform = () => {
    const platform = os.platform();
    switch (platform) {
        case 'darwin':
            return os.arch() === 'arm64' ? 'mac-arm64' : 'mac-x64';
        case 'linux':
            return os.arch() === 'arm64' ? 'linux-arm64' : 'linux64';
        case 'win32':
            return 'win64';
        default:
            throw new Error('Unsupported platform: ' + platform);
    }
};
const getDownloadsFolder = (chromeMode) => {
    const destination = chromeMode === 'headless-shell'
        ? 'chrome-headless-shell'
        : 'chrome-for-testing';
    return path.join((0, get_download_destination_1.getDownloadsCacheDir)(), destination);
};
const getVersionFilePath = (chromeMode) => {
    const downloadsFolder = getDownloadsFolder(chromeMode);
    return path.join(downloadsFolder, 'VERSION');
};
const getExpectedVersion = (version, _chromeMode) => {
    if (version) {
        return version;
    }
    return get_chrome_download_url_1.TESTED_VERSION;
};
const readVersionFile = (chromeMode) => {
    const versionFilePath = getVersionFilePath(chromeMode);
    try {
        return fs.readFileSync(versionFilePath, 'utf-8').trim();
    }
    catch (_a) {
        return null;
    }
};
exports.readVersionFile = readVersionFile;
const writeVersionFile = (chromeMode, version) => {
    const versionFilePath = getVersionFilePath(chromeMode);
    fs.writeFileSync(versionFilePath, version);
};
const downloadBrowser = async ({ logLevel, indent, onProgress, version, chromeMode, }) => {
    const platform = getPlatform();
    const downloadURL = (0, get_chrome_download_url_1.getChromeDownloadUrl)({ platform, version, chromeMode });
    const fileName = downloadURL.split('/').pop();
    if (!fileName) {
        throw new Error(`A malformed download URL was found: ${downloadURL}.`);
    }
    const downloadsFolder = getDownloadsFolder(chromeMode);
    const archivePath = path.join(downloadsFolder, fileName);
    const outputPath = getFolderPath(downloadsFolder, platform);
    const expectedVersion = getExpectedVersion(version, chromeMode);
    if (await existsAsync(outputPath)) {
        const installedVersion = (0, exports.readVersionFile)(chromeMode);
        if (installedVersion === expectedVersion) {
            return (0, exports.getRevisionInfo)(chromeMode);
        }
        // VERSION file missing or mismatched - delete and re-download
        fs.rmSync(outputPath, { recursive: true, force: true });
    }
    if (!(await existsAsync(downloadsFolder))) {
        await mkdirAsync(downloadsFolder, {
            recursive: true,
        });
    }
    if (os.platform() !== 'darwin' &&
        os.platform() !== 'linux' &&
        os.arch() === 'arm64') {
        throw new Error([
            'Chrome Headless Shell is not available for Windows for arm64 architecture.',
        ].join('\n'));
    }
    (0, get_chrome_download_url_1.logDownloadUrl)({ url: downloadURL, logLevel, indent });
    try {
        await (0, download_file_1.downloadFile)({
            url: downloadURL,
            to: () => archivePath,
            onProgress: (progress) => {
                if (progress.totalSize === null || progress.percent === null) {
                    throw new Error('Expected totalSize and percent to be defined');
                }
                onProgress({
                    downloadedBytes: progress.downloaded,
                    totalSizeInBytes: progress.totalSize,
                    percent: progress.percent,
                    alreadyAvailable: false,
                });
            },
            indent,
            logLevel,
            abortSignal: new AbortController().signal,
        });
        await (0, extract_zip_1.default)(archivePath, { dir: outputPath });
        const possibleSubdirs = [
            'chrome-linux',
            'chrome-headless-shell-linux64',
            'chromium-headless-shell-amazon-linux2023-arm64',
            'chromium-headless-shell-amazon-linux2023-x64',
        ];
        for (const subdir of possibleSubdirs) {
            const chromeLinuxFolder = path.join(outputPath, subdir);
            const chromePath = path.join(chromeLinuxFolder, 'chrome');
            if (fs.existsSync(chromePath)) {
                const chromeHeadlessShellPath = path.join(chromeLinuxFolder, 'chrome-headless-shell');
                fs.renameSync(chromePath, chromeHeadlessShellPath);
            }
            if (fs.existsSync(chromeLinuxFolder)) {
                const targetFolder = path.join(outputPath, 'chrome-headless-shell-' + platform);
                if (chromeLinuxFolder !== targetFolder) {
                    fs.renameSync(chromeLinuxFolder, targetFolder);
                }
            }
        }
    }
    catch (err) {
        return Promise.reject(err);
    }
    finally {
        if (await existsAsync(archivePath)) {
            await unlinkAsync(archivePath);
        }
    }
    writeVersionFile(chromeMode, expectedVersion);
    const revisionInfo = (0, exports.getRevisionInfo)(chromeMode);
    (0, make_file_executable_1.makeFileExecutableIfItIsNot)(revisionInfo.executablePath);
    return revisionInfo;
};
exports.downloadBrowser = downloadBrowser;
const getFolderPath = (downloadsFolder, platform) => {
    return path.resolve(downloadsFolder, platform);
};
const getExecutablePath = (chromeMode) => {
    const downloadsFolder = getDownloadsFolder(chromeMode);
    const platform = getPlatform();
    const folderPath = getFolderPath(downloadsFolder, platform);
    if (chromeMode === 'chrome-for-testing') {
        if (platform === 'mac-arm64' || platform === 'mac-x64') {
            return path.join(folderPath, `chrome-${platform}`, 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
        }
        if (platform === 'win64') {
            return path.join(folderPath, 'chrome-win64', 'chrome.exe');
        }
        if (platform === 'linux64' || platform === 'linux-arm64') {
            return path.join(folderPath, 'chrome-linux64', 'chrome');
        }
        throw new Error('unsupported platform' + platform);
    }
    if (chromeMode === 'headless-shell') {
        return path.join(folderPath, `chrome-headless-shell-${platform}`, platform === 'win64'
            ? 'chrome-headless-shell.exe'
            : platform === 'linux-arm64' || (0, get_chrome_download_url_1.isAmazonLinux2023)()
                ? 'headless_shell'
                : 'chrome-headless-shell');
    }
    throw new Error('unsupported chrome mode' + chromeMode);
};
const getRevisionInfo = (chromeMode) => {
    const executablePath = getExecutablePath(chromeMode);
    const downloadsFolder = getDownloadsFolder(chromeMode);
    const platform = getPlatform();
    const folderPath = getFolderPath(downloadsFolder, platform);
    const url = (0, get_chrome_download_url_1.getChromeDownloadUrl)({ platform, version: null, chromeMode });
    const local = fs.existsSync(folderPath);
    return {
        executablePath,
        folderPath,
        local,
        url,
    };
};
exports.getRevisionInfo = getRevisionInfo;
