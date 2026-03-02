"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioDuration = exports.getAudioDurationInSeconds = void 0;
/* eslint-disable @typescript-eslint/no-use-before-define */
const media_tag_error_handling_1 = require("./media-tag-error-handling");
const p_limit_1 = require("./p-limit");
const limit = (0, p_limit_1.pLimit)(3);
const metadataCache = {};
const fn = (src) => {
    if (metadataCache[src]) {
        return Promise.resolve(metadataCache[src]);
    }
    if (typeof document === 'undefined') {
        throw new Error('getAudioDuration() is only available in the browser.');
    }
    const audio = document.createElement('audio');
    audio.src = src;
    return new Promise((resolve, reject) => {
        const onError = () => {
            (0, media_tag_error_handling_1.onMediaError)({
                error: audio.error,
                src,
                cleanup,
                reject,
                api: 'getAudioDurationInSeconds()',
            });
        };
        const onLoadedMetadata = () => {
            metadataCache[src] = audio.duration;
            resolve(audio.duration);
            cleanup();
        };
        const cleanup = () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('error', onError);
            audio.remove();
        };
        audio.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        audio.addEventListener('error', onError, { once: true });
    });
};
/**
 * @description Gets the duration in seconds of an audio source by creating an invisible `<audio>` tag, loading the audio, and returning the duration.
 * @see [Documentation](https://remotion.dev/docs/get-audio-duration-in-seconds)
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/media-parser/parse-media
 */
const getAudioDurationInSeconds = (src) => {
    return limit(fn, src);
};
exports.getAudioDurationInSeconds = getAudioDurationInSeconds;
/**
 * @deprecated Renamed to `getAudioDurationInSeconds`
 */
const getAudioDuration = (src) => (0, exports.getAudioDurationInSeconds)(src);
exports.getAudioDuration = getAudioDuration;
