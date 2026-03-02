"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeStaticFile = void 0;
const writeStaticFile = async ({ contents, filePath, }) => {
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('writeStaticFile() is not available in read-only Studio');
    }
    const url = new URL(`${window.remotion_staticBase}/api/add-asset`, window.location.origin);
    if (filePath.includes('\\')) {
        return Promise.reject(new Error('File path cannot contain backslashes'));
    }
    url.search = new URLSearchParams({
        filePath,
    }).toString();
    const response = await fetch(url, {
        method: 'POST',
        body: contents,
    });
    if (!response.ok) {
        const jsonResponse = await response.json();
        throw new Error(jsonResponse.error);
    }
};
exports.writeStaticFile = writeStaticFile;
