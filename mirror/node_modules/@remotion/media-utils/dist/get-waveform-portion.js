"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveformPortion = void 0;
const no_react_1 = require("remotion/no-react");
const get_wave_form_samples_1 = require("./get-wave-form-samples");
const validate_channel_1 = require("./validate-channel");
const concatArrays = (arrays) => {
    // sum of individual array lengths
    const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
    const result = new Float32Array(totalLength);
    // for each array - copy it over result
    // next array is copied right after the previous one
    let length = 0;
    for (const array of arrays) {
        result.set(array, length);
        length += array.length;
    }
    return result;
};
/*
 * @description Takes bulky waveform data (for example fetched by getAudioData()) and returns a trimmed and simplified version of it, for simpler visualization
 * @see [Documentation](https://remotion.dev/docs/get-waveform-portion)
 */
const getWaveformPortion = ({ audioData, startTimeInSeconds, durationInSeconds, numberOfSamples, channel = 0, outputRange = 'zero-to-one', dataOffsetInSeconds, normalize = true, }) => {
    (0, validate_channel_1.validateChannel)(channel, audioData.numberOfChannels);
    const waveform = audioData.channelWaveforms[channel];
    const startSample = Math.floor((startTimeInSeconds - (dataOffsetInSeconds !== null && dataOffsetInSeconds !== void 0 ? dataOffsetInSeconds : 0)) * audioData.sampleRate);
    const endSample = Math.floor((startTimeInSeconds - (dataOffsetInSeconds !== null && dataOffsetInSeconds !== void 0 ? dataOffsetInSeconds : 0) + durationInSeconds) *
        audioData.sampleRate);
    const samplesBeforeStart = 0 - startSample;
    const samplesAfterEnd = endSample - waveform.length;
    const clampedStart = Math.max(startSample, 0);
    const clampedEnd = Math.min(waveform.length, endSample);
    const padStart = samplesBeforeStart > 0
        ? new Float32Array(samplesBeforeStart).fill(0)
        : null;
    const padEnd = samplesAfterEnd > 0 ? new Float32Array(samplesAfterEnd).fill(0) : null;
    const arrs = [
        padStart,
        waveform.slice(clampedStart, clampedEnd),
        padEnd,
    ].filter(no_react_1.NoReactInternals.truthy);
    const audioBuffer = arrs.length === 1 ? arrs[0] : concatArrays(arrs);
    return (0, get_wave_form_samples_1.getWaveformSamples)({
        audioBuffer,
        numberOfSamples,
        outputRange,
        normalize,
    }).map((w, i) => {
        return {
            index: i,
            amplitude: w,
        };
    });
};
exports.getWaveformPortion = getWaveformPortion;
