"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flacState = void 0;
const audio_sample_map_1 = require("./audio-sample-map");
const flacState = () => {
    let blockingBitStrategy;
    const audioSamples = (0, audio_sample_map_1.audioSampleMapState)();
    return {
        setBlockingBitStrategy: (strategy) => {
            blockingBitStrategy = strategy;
        },
        getBlockingBitStrategy: () => blockingBitStrategy,
        audioSamples,
    };
};
exports.flacState = flacState;
