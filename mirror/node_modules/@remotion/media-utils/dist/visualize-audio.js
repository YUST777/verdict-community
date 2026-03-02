"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAudio = void 0;
const no_react_1 = require("remotion/no-react");
const get_visualization_1 = require("./fft/get-visualization");
const max_value_cached_1 = require("./fft/max-value-cached");
const cache = {};
/**
 * @description Takes in AudioData (preferably fetched by the useAudioData() hook) and processes it in a way that makes visualizing the audio that is playing at the current frame easy.
 * @description part of @remotion/media-utils
 * @see [Documentation](https://www.remotion.dev/docs/visualize-audio)
 */
const visualizeAudioFrame = ({ audioData, frame, fps, numberOfSamples, optimizeFor, dataOffsetInSeconds, }) => {
    const cacheKey = audioData.resultId + frame + fps + numberOfSamples;
    if (cache[cacheKey]) {
        return cache[cacheKey];
    }
    const maxInt = (0, max_value_cached_1.getMaxPossibleMagnitude)(audioData);
    return (0, get_visualization_1.getVisualization)({
        sampleSize: numberOfSamples * 2,
        data: audioData.channelWaveforms[0],
        frame,
        fps,
        sampleRate: audioData.sampleRate,
        maxInt,
        optimizeFor,
        dataOffsetInSeconds,
    });
};
const visualizeAudio = ({ smoothing = true, optimizeFor = no_react_1.NoReactInternals.ENABLE_V5_BREAKING_CHANGES
    ? 'speed'
    : 'accuracy', dataOffsetInSeconds = 0, ...parameters }) => {
    if (!smoothing) {
        return visualizeAudioFrame({
            ...parameters,
            optimizeFor,
            dataOffsetInSeconds,
            smoothing,
        });
    }
    const toSmooth = [
        parameters.frame - 1,
        parameters.frame,
        parameters.frame + 1,
    ];
    const all = toSmooth.map((s) => {
        return visualizeAudioFrame({
            ...parameters,
            frame: s,
            dataOffsetInSeconds,
            optimizeFor,
            smoothing,
        });
    });
    return new Array(parameters.numberOfSamples).fill(true).map((_x, i) => {
        return (new Array(toSmooth.length)
            .fill(true)
            .map((_, j) => {
            return all[j][i];
        })
            .reduce((a, b) => a + b, 0) / toSmooth.length);
    });
};
exports.visualizeAudio = visualizeAudio;
