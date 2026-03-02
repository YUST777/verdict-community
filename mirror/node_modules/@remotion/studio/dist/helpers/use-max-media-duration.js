"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMaxMediaDuration = void 0;
const media_utils_1 = require("@remotion/media-utils");
const mediabunny_1 = require("mediabunny");
const react_1 = require("react");
const cache = new Map();
const getSrc = (s) => {
    if (s.type === 'video') {
        return s.src;
    }
    if (s.type === 'audio') {
        return s.src;
    }
    return null;
};
const useMaxMediaDuration = (s, fps) => {
    var _a;
    const src = getSrc(s);
    const [maxMediaDuration, setMaxMediaDuration] = (0, react_1.useState)(src ? ((_a = cache.get(src)) !== null && _a !== void 0 ? _a : null) : Infinity);
    (0, react_1.useEffect)(() => {
        if (!src) {
            return;
        }
        const input = new mediabunny_1.Input({
            formats: mediabunny_1.ALL_FORMATS,
            source: new mediabunny_1.UrlSource(src),
        });
        input
            .computeDuration()
            .then((duration) => {
            cache.set(src, Math.floor(duration * fps));
            setMaxMediaDuration(Math.floor(duration * fps));
        })
            .catch((e) => {
            if (e instanceof mediabunny_1.InputDisposedError) {
                return;
            }
            // In case of CORS errors, fall back to getVideoMetadata
            return (0, media_utils_1.getVideoMetadata)(src)
                .then((metadata) => {
                var _a;
                const durationOrInfinity = (_a = metadata.durationInSeconds) !== null && _a !== void 0 ? _a : Infinity;
                cache.set(src, Math.floor(durationOrInfinity * fps));
                setMaxMediaDuration(Math.floor(durationOrInfinity * fps));
            })
                .catch(() => {
                // Silently handle getVideoMetadata failures to prevent unhandled rejections
            });
        });
        return () => {
            input.dispose();
        };
    }, [src, fps]);
    if (maxMediaDuration !== null && (s.type === 'audio' || s.type === 'video')) {
        return maxMediaDuration / s.playbackRate;
    }
    return maxMediaDuration;
};
exports.useMaxMediaDuration = useMaxMediaDuration;
