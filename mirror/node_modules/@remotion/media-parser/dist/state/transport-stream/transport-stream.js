"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transportStreamState = void 0;
const last_emitted_sample_1 = require("./last-emitted-sample");
const next_pes_header_store_1 = require("./next-pes-header-store");
const observed_pes_header_1 = require("./observed-pes-header");
const pts_start_offset_1 = require("./pts-start-offset");
const transportStreamState = () => {
    const streamBuffers = new Map();
    const startOffset = (0, pts_start_offset_1.ptsStartOffsetStore)();
    const lastEmittedSample = (0, last_emitted_sample_1.lastEmittedSampleState)();
    const state = {
        nextPesHeaderStore: (0, next_pes_header_store_1.makeNextPesHeaderStore)(),
        observedPesHeaders: (0, observed_pes_header_1.makeObservedPesHeader)(),
        streamBuffers,
        startOffset,
        resetBeforeSeek: () => {
            state.streamBuffers.clear();
            state.nextPesHeaderStore = (0, next_pes_header_store_1.makeNextPesHeaderStore)();
            // start offset is useful, we can keep it
        },
        lastEmittedSample,
    };
    return state;
};
exports.transportStreamState = transportStreamState;
