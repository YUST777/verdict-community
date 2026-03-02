"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageDimensions = getImageDimensions;
const p_limit_1 = require("./p-limit");
const imageDimensionsCache = {};
const limit = (0, p_limit_1.pLimit)(3);
const fn = async (src) => {
    if (imageDimensionsCache[src]) {
        return imageDimensionsCache[src];
    }
    if (typeof document === 'undefined') {
        throw new Error('getImageDimensions() is only available in the browser.');
    }
    const imageDimensions = await new Promise((resolved, reject) => {
        const image = new Image();
        image.onload = () => {
            const { width, height } = image;
            resolved({ width, height });
        };
        image.onerror = reject;
        image.src = src;
    });
    imageDimensionsCache[src] = imageDimensions;
    return imageDimensions;
};
/*
 * @description Takes an image src, retrieves the dimensions of an image.
 * @see [Documentation](https://remotion.dev/docs/get-image-dimensions)
 */
function getImageDimensions(src) {
    return limit(fn, src);
}
