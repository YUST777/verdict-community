"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyMfraLoad = void 0;
const get_mfra_seeking_box_1 = require("../../containers/iso-base-media/get-mfra-seeking-box");
const log_1 = require("../../log");
const lazyMfraLoad = ({ contentLength, controller, readerInterface, src, logLevel, prefetchCache, }) => {
    let prom = null;
    let result = null;
    const triggerLoad = () => {
        if (prom) {
            return prom;
        }
        log_1.Log.verbose(logLevel, 'Moof box found, trying to lazy load mfra');
        prom = (0, get_mfra_seeking_box_1.getMfraSeekingBox)({
            contentLength,
            controller,
            readerInterface,
            src,
            logLevel,
            prefetchCache,
        }).then((boxes) => {
            log_1.Log.verbose(logLevel, boxes ? 'Lazily found mfra atom.' : 'No mfra atom found.');
            result = boxes;
            return boxes;
        });
        return prom;
    };
    const getIfAlreadyLoaded = () => {
        if (result) {
            return result;
        }
        return null;
    };
    const setFromSeekingHints = (hints) => {
        result = hints.mfraAlreadyLoaded;
    };
    return {
        triggerLoad,
        getIfAlreadyLoaded,
        setFromSeekingHints,
    };
};
exports.lazyMfraLoad = lazyMfraLoad;
