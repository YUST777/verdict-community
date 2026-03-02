"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUrl = void 0;
const resolveUrl = (src) => {
    try {
        const resolvedUrl = typeof window !== 'undefined' && typeof window.location !== 'undefined'
            ? new URL(src, window.location.origin)
            : new URL(src);
        return resolvedUrl;
    }
    catch (_a) {
        return src;
    }
};
exports.resolveUrl = resolveUrl;
