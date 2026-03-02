"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isoBaseMediaState = void 0;
const cached_sample_positions_1 = require("./cached-sample-positions");
const lazy_mfra_load_1 = require("./lazy-mfra-load");
const moov_box_1 = require("./moov-box");
const precomputed_moof_1 = require("./precomputed-moof");
const precomputed_tfra_1 = require("./precomputed-tfra");
const timescale_state_1 = require("./timescale-state");
const isoBaseMediaState = ({ contentLength, controller, readerInterface, src, logLevel, prefetchCache, }) => {
    return {
        flatSamples: (0, cached_sample_positions_1.cachedSamplePositionsState)(),
        moov: (0, moov_box_1.moovState)(),
        mfra: (0, lazy_mfra_load_1.lazyMfraLoad)({
            contentLength,
            controller,
            readerInterface,
            src,
            logLevel,
            prefetchCache,
        }),
        moof: (0, precomputed_moof_1.precomputedMoofState)(),
        tfra: (0, precomputed_tfra_1.precomputedTfraState)(),
        movieTimeScale: (0, timescale_state_1.movieTimeScaleState)(),
    };
};
exports.isoBaseMediaState = isoBaseMediaState;
