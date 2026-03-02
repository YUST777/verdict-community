"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAudio = void 0;
const compositor_1 = require("./compositor/compositor");
/*
 * @description Extracts the audio from a video source and saves it to the specified output path. It does not convert the audio to a different format.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/extract-audio)
 */
const extractAudio = async (options) => {
    var _a, _b;
    const compositor = (0, compositor_1.startLongRunningCompositor)({
        maximumFrameCacheItemsInBytes: null,
        logLevel: (_a = options === null || options === void 0 ? void 0 : options.logLevel) !== null && _a !== void 0 ? _a : 'info',
        indent: false,
        binariesDirectory: (_b = options.binariesDirectory) !== null && _b !== void 0 ? _b : null,
        extraThreads: 0,
    });
    await compositor.executeCommand('ExtractAudio', {
        input_path: options.videoSource,
        output_path: options.audioOutput,
    });
    await compositor.finishCommands();
    await compositor.waitForDone();
};
exports.extractAudio = extractAudio;
