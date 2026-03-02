"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetMetadata = exports.remotion_outputsBase = void 0;
const media_utils_1 = require("@remotion/media-utils");
const remotion_1 = require("remotion");
const Preview_1 = require("../components/Preview");
exports.remotion_outputsBase = window.remotion_staticBase.replace('static', 'outputs');
const getSrcFromCanvasContent = (canvasContent) => {
    if (canvasContent.type === 'asset') {
        return (0, remotion_1.staticFile)(canvasContent.asset);
    }
    return exports.remotion_outputsBase + canvasContent.path;
};
const getAssetMetadata = async (canvasContent, addTime) => {
    if (canvasContent.type === 'output-blob') {
        return {
            type: 'found',
            size: canvasContent.sizeInBytes,
            dimensions: { width: canvasContent.width, height: canvasContent.height },
            fetchedAt: Date.now(),
        };
    }
    if (canvasContent.type === 'composition') {
        throw new Error('cannot get dimensions for composition');
    }
    const src = getSrcFromCanvasContent(canvasContent);
    const file = await fetch(src, {
        method: 'HEAD',
    });
    if (file.status === 404) {
        return { type: 'not-found' };
    }
    if (file.status !== 200) {
        throw new Error(`Expected status code 200 or 404 for file, got ${file.status}`);
    }
    const size = file.headers.get('content-length');
    if (!size) {
        throw new Error('Unexpected error: content-length is null');
    }
    const fetchedAt = Date.now();
    const srcWithTime = addTime ? `${src}?date=${fetchedAt}` : src;
    const fileType = (0, Preview_1.getPreviewFileType)(src);
    if (fileType === 'video') {
        const resolution = await (0, media_utils_1.getVideoMetadata)(srcWithTime);
        return {
            type: 'found',
            size: Number(size),
            dimensions: { width: resolution.width, height: resolution.height },
            fetchedAt,
        };
    }
    if (fileType === 'image') {
        const resolution = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    type: 'found',
                    size: Number(size),
                    dimensions: { width: img.width, height: img.height },
                    fetchedAt,
                });
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = srcWithTime;
        });
        return resolution;
    }
    return {
        type: 'found',
        dimensions: 'none',
        size: Number(size),
        fetchedAt,
    };
};
exports.getAssetMetadata = getAssetMetadata;
