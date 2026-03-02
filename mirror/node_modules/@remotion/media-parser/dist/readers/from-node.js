"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeReader = exports.nodeCreateAdjacentFileSource = exports.nodeReadWholeAsText = exports.nodeReadContent = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const nodeReadContent = async ({ src, range, controller, }) => {
    if (typeof src !== 'string') {
        throw new Error('src must be a string when using `nodeReader`');
    }
    await Promise.resolve();
    const ownController = new AbortController();
    try {
        if (!(0, fs_1.existsSync)(src)) {
            throw new Error(`File does not exist: ${src}`);
        }
        const stream = (0, fs_1.createReadStream)(src, {
            start: range === null ? 0 : typeof range === 'number' ? range : range[0],
            end: range === null
                ? Infinity
                : typeof range === 'number'
                    ? Infinity
                    : range[1],
        });
        controller._internals.signal.addEventListener('abort', () => {
            ownController.abort();
        }, { once: true });
        const stats = (0, fs_1.statSync)(src);
        let readerCancelled = false;
        const reader = new ReadableStream({
            start(c) {
                if (readerCancelled) {
                    return;
                }
                stream.on('data', (chunk) => {
                    c.enqueue(chunk);
                });
                stream.on('end', () => {
                    if (readerCancelled) {
                        return;
                    }
                    c.close();
                });
                stream.on('error', (err) => {
                    c.error(err);
                });
            },
            cancel() {
                readerCancelled = true;
                stream.destroy();
            },
        }).getReader();
        if (controller) {
            controller._internals.signal.addEventListener('abort', () => {
                reader.cancel().catch(() => { });
            }, { once: true });
        }
        return Promise.resolve({
            reader: {
                reader,
                abort: async () => {
                    try {
                        stream.destroy();
                        ownController.abort();
                        await reader.cancel();
                    }
                    catch (_a) { }
                },
            },
            contentLength: stats.size,
            contentType: null,
            name: src.split(path_1.sep).pop(),
            supportsContentRange: true,
            needsContentRange: true,
        });
    }
    catch (err) {
        return Promise.reject(err);
    }
};
exports.nodeReadContent = nodeReadContent;
const nodeReadWholeAsText = (src) => {
    if (typeof src !== 'string') {
        throw new Error('src must be a string when using `nodeReader`');
    }
    return fs_1.promises.readFile(src, 'utf8');
};
exports.nodeReadWholeAsText = nodeReadWholeAsText;
const nodeCreateAdjacentFileSource = (relativePath, src) => {
    if (typeof src !== 'string') {
        throw new Error('src must be a string when using `nodeReader`');
    }
    const result = (0, path_1.join)((0, path_1.dirname)(src), relativePath);
    const rel = (0, path_1.relative)((0, path_1.dirname)(src), result);
    if (rel.startsWith('..')) {
        throw new Error('Path is outside of the parent directory - not allowing reading of arbitrary files');
    }
    return result;
};
exports.nodeCreateAdjacentFileSource = nodeCreateAdjacentFileSource;
exports.nodeReader = {
    read: exports.nodeReadContent,
    readWholeAsText: exports.nodeReadWholeAsText,
    createAdjacentFileSource: exports.nodeCreateAdjacentFileSource,
    preload: () => {
        // doing nothing, it's just for when fetching over the network
    },
};
