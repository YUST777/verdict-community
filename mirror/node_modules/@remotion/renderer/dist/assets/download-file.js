"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
const node_fs_1 = require("node:fs");
const ensure_output_directory_1 = require("../ensure-output-directory");
const logger_1 = require("../logger");
const read_file_1 = require("./read-file");
const CANCELLED_ERROR = 'cancelled';
const incorrectContentLengthToken = 'Download finished with';
const noDataSentToken = 'but the server sent no data for';
const downloadFileWithoutRetries = ({ onProgress, url, to: toFn, abortSignal, }) => {
    return new Promise((resolve, reject) => {
        let rejected = false;
        let resolved = false;
        let timeout;
        const resolveAndFlag = (val) => {
            abortSignal.removeEventListener('abort', onAbort);
            resolved = true;
            resolve(val);
            if (timeout) {
                clearTimeout(timeout);
            }
        };
        const rejectAndFlag = (err) => {
            abortSignal.removeEventListener('abort', onAbort);
            if (timeout) {
                clearTimeout(timeout);
            }
            reject(err);
            rejected = true;
        };
        const refreshTimeout = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                if (resolved) {
                    return;
                }
                rejectAndFlag(new Error(`Tried to download file ${url}, ${noDataSentToken} 20 seconds`));
            }, 20000);
        };
        refreshTimeout();
        let finishEventSent = false;
        let closeConnection = () => undefined;
        const onAbort = () => {
            rejectAndFlag(new Error(CANCELLED_ERROR));
            closeConnection();
        };
        abortSignal.addEventListener('abort', onAbort);
        (0, read_file_1.readFile)(url)
            .then(({ response, request }) => {
            var _a, _b;
            closeConnection = () => {
                request.destroy();
                response.destroy();
            };
            if (abortSignal.aborted) {
                onAbort();
                return;
            }
            const contentDisposition = (_a = response.headers['content-disposition']) !== null && _a !== void 0 ? _a : null;
            const contentType = (_b = response.headers['content-type']) !== null && _b !== void 0 ? _b : null;
            const to = toFn(contentDisposition, contentType);
            (0, ensure_output_directory_1.ensureOutputDirectory)(to);
            const sizeHeader = response.headers['content-length'];
            const totalSize = typeof sizeHeader === 'undefined' ? null : Number(sizeHeader);
            const writeStream = (0, node_fs_1.createWriteStream)(to);
            let downloaded = 0;
            // Listen to 'close' event instead of more
            // concise method to avoid this problem
            // https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
            writeStream.on('close', () => {
                if (rejected) {
                    return;
                }
                if (!finishEventSent) {
                    onProgress === null || onProgress === void 0 ? void 0 : onProgress({
                        downloaded,
                        percent: 1,
                        totalSize: downloaded,
                    });
                }
                refreshTimeout();
                return resolveAndFlag({ sizeInBytes: downloaded, to });
            });
            writeStream.on('error', (err) => rejectAndFlag(err));
            response.on('error', (err) => {
                closeConnection();
                rejectAndFlag(err);
            });
            response.pipe(writeStream).on('error', (err) => rejectAndFlag(err));
            response.on('data', (d) => {
                refreshTimeout();
                downloaded += d.length;
                refreshTimeout();
                const percent = totalSize === null ? null : downloaded / totalSize;
                onProgress === null || onProgress === void 0 ? void 0 : onProgress({
                    downloaded,
                    percent,
                    totalSize,
                });
                if (percent === 1) {
                    finishEventSent = true;
                }
            });
            response.on('close', () => {
                if (totalSize !== null && downloaded !== totalSize) {
                    rejectAndFlag(new Error(`${incorrectContentLengthToken} ${downloaded} bytes, but expected ${totalSize} bytes from 'Content-Length'.`));
                }
                writeStream.close();
                closeConnection();
            });
        })
            .catch((err) => {
            rejectAndFlag(err);
        });
    });
};
const downloadFile = async (options, retries = 2, attempt = 1) => {
    try {
        const res = await downloadFileWithoutRetries(options);
        return res;
    }
    catch (err) {
        const { message } = err;
        if (message === CANCELLED_ERROR) {
            throw err;
        }
        if (message === 'aborted' ||
            message.includes('ECONNRESET') ||
            message.includes(incorrectContentLengthToken) ||
            message.includes(noDataSentToken) ||
            // Try again if hitting internal errors
            message.includes('503') ||
            message.includes('502') ||
            message.includes('504') ||
            message.includes('500')) {
            if (retries === 0) {
                throw err;
            }
            logger_1.Log.warn({ indent: options.indent, logLevel: options.logLevel }, `Downloading ${options.url} failed (will retry): ${message}`);
            const backoffInSeconds = (attempt + 1) ** 2;
            await new Promise((resolve) => {
                setTimeout(() => resolve(), backoffInSeconds * 1000);
            });
            return (0, exports.downloadFile)(options, retries - 1, attempt + 1);
        }
        throw err;
    }
};
exports.downloadFile = downloadFile;
