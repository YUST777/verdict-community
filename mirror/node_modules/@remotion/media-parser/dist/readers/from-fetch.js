"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchReader = exports.fetchCreateAdjacentFileSource = exports.fetchReadWholeAsText = exports.fetchPreload = exports.fetchReadContent = exports.makeFetchRequest = void 0;
exports.parseContentRange = parseContentRange;
const errors_1 = require("../errors");
const log_1 = require("../log");
const get_body_and_reader_1 = require("./fetch/get-body-and-reader");
const resolve_url_1 = require("./fetch/resolve-url");
/**
 * Parse Content-Range header.
 * From: https://github.com/gregberge/content-range/blob/main/src/index.ts
 */
function parseContentRange(input) {
    const matches = input.match(/^(\w+) ((\d+)-(\d+)|\*)\/(\d+|\*)$/);
    if (!matches)
        return null;
    const [, unit, , start, end, size] = matches;
    const range = {
        unit,
        start: start != null ? Number(start) : null,
        end: end != null ? Number(end) : null,
        size: size === '*' ? null : Number(size),
    };
    if (range.start === null && range.end === null && range.size === null) {
        return null;
    }
    return range;
}
const validateContentRangeAndDetectIfSupported = ({ requestedRange, parsedContentRange, statusCode, }) => {
    if (statusCode === 206) {
        return { supportsContentRange: true };
    }
    if (typeof requestedRange === 'number' &&
        (parsedContentRange === null || parsedContentRange === void 0 ? void 0 : parsedContentRange.start) !== requestedRange) {
        if (requestedRange === 0) {
            return { supportsContentRange: false };
        }
        throw new Error(`Range header (${requestedRange}) does not match content-range header (${parsedContentRange === null || parsedContentRange === void 0 ? void 0 : parsedContentRange.start})`);
    }
    if (requestedRange !== null &&
        typeof requestedRange !== 'number' &&
        ((parsedContentRange === null || parsedContentRange === void 0 ? void 0 : parsedContentRange.start) !== requestedRange[0] ||
            (parsedContentRange === null || parsedContentRange === void 0 ? void 0 : parsedContentRange.end) !== requestedRange[1])) {
        throw new Error(`Range header (${requestedRange}) does not match content-range header (${parsedContentRange === null || parsedContentRange === void 0 ? void 0 : parsedContentRange.start})`);
    }
    return { supportsContentRange: true };
};
const makeFetchRequest = async ({ range, src, controller, }) => {
    var _a;
    const resolvedUrl = (0, resolve_url_1.resolveUrl)(src);
    const resolvedUrlString = resolvedUrl.toString();
    if (!resolvedUrlString.startsWith('https://') &&
        !resolvedUrlString.startsWith('blob:') &&
        !resolvedUrlString.startsWith('data:') &&
        !resolvedUrlString.startsWith('http://')) {
        return Promise.reject(new Error(`${resolvedUrlString} is not a URL - needs to start with http:// or https:// or blob:. If you want to read a local file, pass \`reader: nodeReader\` to parseMedia().`));
    }
    const ownController = new AbortController();
    const cache = typeof navigator !== 'undefined' &&
        navigator.userAgent.includes('Cloudflare-Workers')
        ? undefined
        : // Disable Next.js caching
            'no-store';
    const requestedRange = range === null ? 0 : range;
    const asString = typeof resolvedUrl === 'string' ? resolvedUrl : resolvedUrl.pathname;
    const requestWithoutRange = asString.endsWith('.m3u8');
    const canLiveWithoutContentLength = asString.endsWith('.m3u8') || asString.endsWith('.ts');
    const headers = requestedRange === 0 && requestWithoutRange
        ? {}
        : typeof requestedRange === 'number'
            ? {
                Range: `bytes=${requestedRange}-`,
            }
            : {
                Range: `bytes=${`${requestedRange[0]}-${requestedRange[1]}`}`,
            };
    const res = await fetch(resolvedUrl, {
        headers,
        signal: ownController.signal,
        cache,
    });
    const contentRange = res.headers.get('content-range');
    const parsedContentRange = contentRange
        ? parseContentRange(contentRange)
        : null;
    if (!res.ok) {
        throw new Error(`Server returned status code ${res.status} for ${resolvedUrl} and range ${requestedRange}`);
    }
    const { supportsContentRange } = validateContentRangeAndDetectIfSupported({
        requestedRange,
        parsedContentRange,
        statusCode: res.status,
    });
    if (controller) {
        controller._internals.signal.addEventListener('abort', () => {
            ownController.abort(new errors_1.MediaParserAbortError('Aborted by user'));
        }, { once: true });
    }
    const contentDisposition = res.headers.get('content-disposition');
    const name = (_a = contentDisposition === null || contentDisposition === void 0 ? void 0 : contentDisposition.match(/filename="([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
    const { contentLength, needsContentRange, reader } = await (0, get_body_and_reader_1.getLengthAndReader)({
        canLiveWithoutContentLength,
        res,
        ownController,
        requestedWithoutRange: requestWithoutRange,
    });
    const contentType = res.headers.get('content-type');
    return {
        contentLength,
        needsContentRange,
        reader,
        name,
        contentType,
        supportsContentRange,
    };
};
exports.makeFetchRequest = makeFetchRequest;
const cacheKey = ({ src, range, }) => {
    return `${src}-${JSON.stringify(range)}`;
};
const makeFetchRequestOrGetCached = ({ range, src, controller, logLevel, prefetchCache, }) => {
    const key = cacheKey({ src, range });
    const cached = prefetchCache.get(key);
    if (cached) {
        log_1.Log.verbose(logLevel, `Reading from preload cache for ${key}`);
        return cached;
    }
    log_1.Log.verbose(logLevel, `Fetching ${key}`);
    const result = (0, exports.makeFetchRequest)({ range, src, controller });
    prefetchCache.set(key, result);
    return result;
};
const fetchReadContent = async ({ src, range, controller, logLevel, prefetchCache, }) => {
    if (typeof src !== 'string' && src instanceof URL === false) {
        throw new Error('src must be a string when using `fetchReader`');
    }
    const fallbackName = src.toString().split('/').pop();
    const res = makeFetchRequestOrGetCached({
        range,
        src,
        controller,
        logLevel,
        prefetchCache,
    });
    const key = cacheKey({ src, range });
    prefetchCache.delete(key);
    const { reader, contentLength, needsContentRange, name, supportsContentRange, contentType, } = await res;
    if (controller) {
        controller._internals.signal.addEventListener('abort', () => {
            reader.reader.cancel().catch(() => {
                // Prevent unhandled rejection in Firefox
            });
        }, { once: true });
    }
    return {
        reader,
        contentLength,
        contentType,
        name: name !== null && name !== void 0 ? name : fallbackName,
        supportsContentRange,
        needsContentRange,
    };
};
exports.fetchReadContent = fetchReadContent;
const fetchPreload = ({ src, range, logLevel, prefetchCache, }) => {
    if (typeof src !== 'string' && src instanceof URL === false) {
        throw new Error('src must be a string when using `fetchReader`');
    }
    const key = cacheKey({ src, range });
    if (prefetchCache.has(key)) {
        return prefetchCache.get(key);
    }
    makeFetchRequestOrGetCached({
        range,
        src,
        controller: null,
        logLevel,
        prefetchCache,
    });
};
exports.fetchPreload = fetchPreload;
const fetchReadWholeAsText = async (src) => {
    if (typeof src !== 'string' && src instanceof URL === false) {
        throw new Error('src must be a string when using `fetchReader`');
    }
    const res = await fetch(src);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${src} (HTTP code: ${res.status})`);
    }
    return res.text();
};
exports.fetchReadWholeAsText = fetchReadWholeAsText;
const fetchCreateAdjacentFileSource = (relativePath, src) => {
    if (typeof src !== 'string' && src instanceof URL === false) {
        throw new Error('src must be a string or URL when using `fetchReader`');
    }
    return new URL(relativePath, src).toString();
};
exports.fetchCreateAdjacentFileSource = fetchCreateAdjacentFileSource;
exports.fetchReader = {
    read: exports.fetchReadContent,
    readWholeAsText: exports.fetchReadWholeAsText,
    createAdjacentFileSource: exports.fetchCreateAdjacentFileSource,
    preload: exports.fetchPreload,
};
