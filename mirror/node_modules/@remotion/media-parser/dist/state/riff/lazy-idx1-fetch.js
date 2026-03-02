"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyIdx1Fetch = void 0;
const fetch_idx1_1 = require("../../containers/riff/seek/fetch-idx1");
const lazyIdx1Fetch = ({ controller, logLevel, readerInterface, src, prefetchCache, contentLength, }) => {
    let prom = null;
    let result = null;
    const triggerLoad = (position) => {
        if (result) {
            return Promise.resolve(result);
        }
        if (prom) {
            return prom;
        }
        prom = (0, fetch_idx1_1.fetchIdx1)({
            controller,
            logLevel,
            position,
            readerInterface,
            src,
            prefetchCache,
            contentLength,
        }).then((entries) => {
            prom = null;
            result = entries;
            return entries;
        });
        return prom;
    };
    const getLoadedIdx1 = async () => {
        if (!prom) {
            return null;
        }
        const entries = await prom;
        return entries;
    };
    const getIfAlreadyLoaded = () => {
        if (result) {
            return result;
        }
        return null;
    };
    const setFromSeekingHints = (hints) => {
        if (hints.idx1Entries) {
            result = hints.idx1Entries;
        }
    };
    const waitForLoaded = () => {
        if (result) {
            return Promise.resolve(result);
        }
        if (prom) {
            return prom;
        }
        return Promise.resolve(null);
    };
    return {
        triggerLoad,
        getLoadedIdx1,
        getIfAlreadyLoaded,
        setFromSeekingHints,
        waitForLoaded,
    };
};
exports.lazyIdx1Fetch = lazyIdx1Fetch;
