"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchStaticFile = void 0;
const remotion_1 = require("remotion");
const watch_public_folder_1 = require("./watch-public-folder");
/*
 * @description Watches for changes in a specific static file and invokes a callback function when the file changes, enabling dynamic updates in your Remotion projects.
 * @see [Documentation](https://www.remotion.dev/docs/studio/watch-static-file)
 */
const watchStaticFile = (fileName, callback) => {
    if (!(0, remotion_1.getRemotionEnvironment)().isStudio) {
        // eslint-disable-next-line no-console
        console.warn('watchStaticFile() is only available while using the Remotion Studio.');
        return { cancel: () => undefined };
    }
    if (window.remotion_isReadOnlyStudio) {
        // eslint-disable-next-line no-console
        console.warn('watchStaticFile() is only available in an interactive Studio.');
        return { cancel: () => undefined };
    }
    const withoutStaticBase = fileName.startsWith(window.remotion_staticBase)
        ? fileName.replace(window.remotion_staticBase, '')
        : fileName;
    const withoutLeadingSlash = withoutStaticBase.startsWith('/')
        ? withoutStaticBase.slice(1)
        : withoutStaticBase;
    let prevFileData = window.remotion_staticFiles.find((file) => file.name === withoutLeadingSlash);
    const { cancel } = (0, watch_public_folder_1.watchPublicFolder)((staticFiles) => {
        // Check for user specified file
        const newFileData = staticFiles.find((file) => file.name === withoutLeadingSlash);
        if (!newFileData) {
            // File is deleted
            if (prevFileData !== undefined) {
                callback(null);
            }
            prevFileData = undefined;
            return;
        }
        if (prevFileData === undefined ||
            prevFileData.lastModified !== newFileData.lastModified) {
            callback(newFileData); // File is added or modified
            prevFileData = newFileData;
        }
    });
    return { cancel };
};
exports.watchStaticFile = watchStaticFile;
