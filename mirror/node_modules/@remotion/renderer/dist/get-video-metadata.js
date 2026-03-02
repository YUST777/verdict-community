"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoMetadata = void 0;
const node_path_1 = require("node:path");
const compositor_1 = require("./compositor/compositor");
/**
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/media-parser/parse-media
 */
const getVideoMetadata = async (videoSource, options) => {
    var _a, _b;
    const compositor = (0, compositor_1.startLongRunningCompositor)({
        maximumFrameCacheItemsInBytes: null,
        logLevel: (_a = options === null || options === void 0 ? void 0 : options.logLevel) !== null && _a !== void 0 ? _a : 'info',
        indent: false,
        binariesDirectory: (_b = options === null || options === void 0 ? void 0 : options.binariesDirectory) !== null && _b !== void 0 ? _b : null,
        extraThreads: 0,
    });
    const metadataResponse = await compositor.executeCommand('GetVideoMetadata', {
        src: (0, node_path_1.resolve)(process.cwd(), videoSource),
    });
    await compositor.finishCommands();
    await compositor.waitForDone();
    return JSON.parse(new TextDecoder('utf-8').decode(metadataResponse));
};
exports.getVideoMetadata = getVideoMetadata;
