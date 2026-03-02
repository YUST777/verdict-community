"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEncodableAudioCodecs = void 0;
const web_renderer_1 = require("@remotion/web-renderer");
const react_1 = require("react");
const useEncodableAudioCodecs = (container) => {
    var _a;
    const cacheRef = (0, react_1.useRef)({});
    const [codecsByContainer, setCodecsByContainer] = (0, react_1.useState)(() => {
        // Initialize with fallback for the current container
        return {
            [container]: (0, web_renderer_1.getSupportedAudioCodecsForContainer)(container),
        };
    });
    (0, react_1.useEffect)(() => {
        const cached = cacheRef.current[container];
        // Already fetched or currently fetching for this container
        if (cached) {
            return;
        }
        const supported = (0, web_renderer_1.getSupportedAudioCodecsForContainer)(container);
        // Mark as fetching to prevent duplicate requests
        cacheRef.current[container] = {
            codecs: supported,
            status: 'fetching',
        };
        (0, web_renderer_1.getEncodableAudioCodecs)(container)
            .then((encodable) => {
            cacheRef.current[container] = {
                codecs: encodable,
                status: 'done',
            };
            setCodecsByContainer((prev) => ({
                ...prev,
                [container]: encodable,
            }));
        })
            .catch(() => {
            // On error, keep using the supported codecs fallback
            cacheRef.current[container] = {
                codecs: supported,
                status: 'done',
            };
        });
    }, [container]);
    // Return codecs for current container, or fall back to supported codecs
    return ((_a = codecsByContainer[container]) !== null && _a !== void 0 ? _a : (0, web_renderer_1.getSupportedAudioCodecsForContainer)(container));
};
exports.useEncodableAudioCodecs = useEncodableAudioCodecs;
