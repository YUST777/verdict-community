"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyCuesFetch = void 0;
const fetch_web_cues_1 = require("../../containers/webm/seek/fetch-web-cues");
const log_1 = require("../../log");
const lazyCuesFetch = ({ controller, logLevel, readerInterface, src, prefetchCache, }) => {
    let prom = null;
    let sOffset = null;
    let result = null;
    const triggerLoad = (position, segmentOffset) => {
        if (result) {
            return Promise.resolve(result);
        }
        if (prom) {
            return prom;
        }
        if (sOffset && sOffset !== segmentOffset) {
            throw new Error('Segment offset mismatch');
        }
        sOffset = segmentOffset;
        log_1.Log.verbose(logLevel, 'Cues box found, trying to lazy load cues');
        prom = (0, fetch_web_cues_1.fetchWebmCues)({
            controller,
            logLevel,
            position,
            readerInterface,
            src,
            prefetchCache,
        }).then((cues) => {
            log_1.Log.verbose(logLevel, 'Cues loaded');
            result = cues;
            return cues;
        });
        return prom;
    };
    const getLoadedCues = async () => {
        if (!prom) {
            return null;
        }
        if (result) {
            if (!sOffset) {
                throw new Error('Segment offset not set');
            }
            return {
                cues: result,
                segmentOffset: sOffset,
            };
        }
        const cues = await prom;
        if (!cues) {
            return null;
        }
        if (!sOffset) {
            throw new Error('Segment offset not set');
        }
        return {
            cues,
            segmentOffset: sOffset,
        };
    };
    const getIfAlreadyLoaded = () => {
        if (result) {
            if (sOffset === null) {
                throw new Error('Segment offset not set');
            }
            return {
                cues: result,
                segmentOffset: sOffset,
            };
        }
        return null;
    };
    const setFromSeekingHints = (hints) => {
        var _a, _b, _c, _d;
        result = (_b = (_a = hints.loadedCues) === null || _a === void 0 ? void 0 : _a.cues) !== null && _b !== void 0 ? _b : null;
        sOffset = (_d = (_c = hints.loadedCues) === null || _c === void 0 ? void 0 : _c.segmentOffset) !== null && _d !== void 0 ? _d : null;
    };
    return {
        triggerLoad,
        getLoadedCues,
        getIfAlreadyLoaded,
        setFromSeekingHints,
    };
};
exports.lazyCuesFetch = lazyCuesFetch;
