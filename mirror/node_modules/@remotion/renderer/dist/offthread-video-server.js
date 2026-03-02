"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffthreadVideoServerEmitter = exports.startOffthreadVideoServer = exports.extractUrlAndSourceFromUrl = void 0;
const node_url_1 = require("node:url");
const download_and_map_assets_to_file_1 = require("./assets/download-and-map-assets-to-file");
const compositor_1 = require("./compositor/compositor");
const log_level_1 = require("./log-level");
const logger_1 = require("./logger");
const offthreadvideo_cache_size_1 = require("./options/offthreadvideo-cache-size");
const extractUrlAndSourceFromUrl = (url) => {
    const parsed = new URL(url, 'http://localhost');
    const query = parsed.search;
    if (!query.trim()) {
        throw new Error('Expected query from ' + url);
    }
    const params = new node_url_1.URLSearchParams(query);
    const src = params.get('src');
    if (!src) {
        throw new Error('Did not pass `src` parameter');
    }
    const time = params.get('time');
    if (!time) {
        throw new Error('Did not get `time` parameter');
    }
    const transparent = params.get('transparent');
    const toneMapped = params.get('toneMapped');
    if (!toneMapped) {
        throw new Error('Did not get `toneMapped` parameter');
    }
    return {
        src,
        time: parseFloat(time),
        transparent: transparent === 'true',
        toneMapped: toneMapped === 'true',
    };
};
exports.extractUrlAndSourceFromUrl = extractUrlAndSourceFromUrl;
const REQUEST_CLOSED_TOKEN = 'Request closed';
const startOffthreadVideoServer = ({ downloadMap, logLevel, indent, offthreadVideoCacheSizeInBytes, binariesDirectory, offthreadVideoThreads, }) => {
    (0, offthreadvideo_cache_size_1.validateOffthreadVideoCacheSizeInBytes)(offthreadVideoCacheSizeInBytes);
    const compositor = (0, compositor_1.startCompositor)({
        type: 'StartLongRunningProcess',
        payload: {
            concurrency: offthreadVideoThreads,
            maximum_frame_cache_size_in_bytes: offthreadVideoCacheSizeInBytes,
            verbose: (0, log_level_1.isEqualOrBelowLogLevel)(logLevel, 'verbose'),
        },
        logLevel,
        indent,
        binariesDirectory,
    });
    return {
        close: () => {
            return compositor.shutDownOrKill();
        },
        listener: (req, response) => {
            if (!req.url) {
                throw new Error('Request came in without URL');
            }
            if (!req.url.startsWith('/proxy')) {
                response.writeHead(404);
                response.end();
                return;
            }
            const { src, time, transparent, toneMapped } = (0, exports.extractUrlAndSourceFromUrl)(req.url);
            response.setHeader('access-control-allow-origin', '*');
            // Prevent caching of the response and excessive disk writes
            // https://github.com/remotion-dev/remotion/issues/2760
            response.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
            // Handling this case on Lambda:
            // https://support.google.com/chrome/a/answer/7679408?hl=en
            // Chrome sends Private Network Access preflights for subresources
            if (req.method === 'OPTIONS') {
                response.statusCode = 200;
                if (req.headers['access-control-request-private-network']) {
                    response.setHeader('Access-Control-Allow-Private-Network', 'true');
                }
                response.end();
                return;
            }
            let closed = false;
            req.on('close', () => {
                closed = true;
            });
            let extractStart = Date.now();
            (0, download_and_map_assets_to_file_1.downloadAsset)({
                src,
                downloadMap,
                indent,
                logLevel,
                binariesDirectory,
                cancelSignalForAudioAnalysis: undefined,
                shouldAnalyzeAudioImmediately: true,
                audioStreamIndex: undefined,
            })
                .then((to) => {
                return new Promise((resolve, reject) => {
                    if (closed) {
                        reject(Error(REQUEST_CLOSED_TOKEN));
                        return;
                    }
                    extractStart = Date.now();
                    compositor
                        .executeCommand('ExtractFrame', {
                        src: to,
                        original_src: src,
                        time,
                        transparent,
                        tone_mapped: toneMapped,
                    })
                        .then(resolve)
                        .catch(reject);
                });
            })
                .then((readable) => {
                return new Promise((resolve, reject) => {
                    if (closed) {
                        reject(Error(REQUEST_CLOSED_TOKEN));
                        return;
                    }
                    if (!readable) {
                        reject(new Error('no readable from compositor'));
                        return;
                    }
                    const extractEnd = Date.now();
                    const timeToExtract = extractEnd - extractStart;
                    if (timeToExtract > 1000) {
                        logger_1.Log.verbose({ indent, logLevel }, `Took ${timeToExtract}ms to extract frame from ${src} at ${time}`);
                    }
                    const firstByte = readable.at(0);
                    const secondByte = readable.at(1);
                    const thirdByte = readable.at(2);
                    const isPng = firstByte === 0x89 && secondByte === 0x50 && thirdByte === 0x4e;
                    const isBmp = firstByte === 0x42 && secondByte === 0x4d;
                    if (isPng) {
                        response.setHeader('content-type', `image/png`);
                        response.setHeader('content-length', readable.byteLength);
                    }
                    else if (isBmp) {
                        response.setHeader('content-type', `image/bmp`);
                        response.setHeader('content-length', readable.byteLength);
                    }
                    else {
                        reject(new Error(`Unknown file type: ${firstByte} ${secondByte} ${thirdByte}`));
                        return;
                    }
                    response.writeHead(200);
                    response.write(readable, (err) => {
                        response.end();
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            })
                .catch((err) => {
                logger_1.Log.error({ indent, logLevel }, 'Could not extract frame from compositor', err);
                if (response.headersSent) {
                    logger_1.Log.error({ indent, logLevel }, 'Cannot propagate error message to client because headers have already been sent');
                }
                else {
                    response.writeHead(500);
                    response.write(JSON.stringify({ error: err.stack }));
                }
                response.end();
            });
        },
        compositor,
    };
};
exports.startOffthreadVideoServer = startOffthreadVideoServer;
class OffthreadVideoServerEmitter {
    listeners = {
        progress: [],
        download: [],
    };
    addEventListener(name, callback) {
        this.listeners[name].push(callback);
        return () => {
            this.removeEventListener(name, callback);
        };
    }
    removeEventListener(name, callback) {
        this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback) => {
            callback({ detail: context });
        });
    }
    dispatchDownloadProgress(src, percent, downloaded, totalSize) {
        this.dispatchEvent('progress', {
            downloaded,
            percent,
            totalSize,
            src,
        });
    }
    dispatchDownload(src) {
        this.dispatchEvent('download', {
            src,
        });
    }
}
exports.OffthreadVideoServerEmitter = OffthreadVideoServerEmitter;
