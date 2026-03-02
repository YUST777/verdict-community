"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchPublicFolder = exports.WATCH_REMOTION_STATIC_FILES = void 0;
const remotion_1 = require("remotion");
const get_static_files_1 = require("./get-static-files");
exports.WATCH_REMOTION_STATIC_FILES = 'remotion_staticFilesChanged';
/*
 * @description Watches for changes in the public directory and calls a callback function when a file is added, removed, or modified.
 * @see [Documentation](https://www.remotion.dev/docs/studio/watch-public-folder)
 */
const watchPublicFolder = (callback) => {
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        // eslint-disable-next-line no-console
        console.warn('The watchPublicFolder() API is only available while using the Remotion Studio.');
        return { cancel: () => undefined };
    }
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('watchPublicFolder() is not available in read-only Studio');
    }
    const emitUpdate = () => {
        callback((0, get_static_files_1.getStaticFiles)());
    };
    window.addEventListener(exports.WATCH_REMOTION_STATIC_FILES, emitUpdate);
    const cancel = () => {
        return window.removeEventListener(exports.WATCH_REMOTION_STATIC_FILES, emitUpdate);
    };
    return { cancel };
};
exports.watchPublicFolder = watchPublicFolder;
