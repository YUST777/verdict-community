"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aacState = void 0;
const audio_sample_map_1 = require("./audio-sample-map");
const aacState = () => {
    const samples = [];
    // seems redunant, we could deduplicate this
    const audioSamples = (0, audio_sample_map_1.audioSampleMapState)();
    return {
        addSample: ({ offset, size }) => {
            const index = samples.findIndex((s) => s.offset === offset);
            if (index !== -1) {
                return samples[index];
            }
            samples.push({ offset, index: samples.length, size });
            return samples[samples.length - 1];
        },
        getSamples: () => samples,
        audioSamples,
    };
};
exports.aacState = aacState;
