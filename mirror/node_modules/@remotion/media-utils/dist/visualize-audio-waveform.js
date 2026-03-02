"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAudioWaveform = void 0;
const get_waveform_portion_1 = require("./get-waveform-portion");
const cache = {};
const visualizeAudioWaveformFrame = ({ audioData, frame, fps, numberOfSamples, windowInSeconds, channel, dataOffsetInSeconds, normalize = false, }) => {
    if (windowInSeconds * audioData.sampleRate < numberOfSamples) {
        throw new TypeError(windowInSeconds +
            's audiodata does not have ' +
            numberOfSamples +
            ' bars. Increase windowInSeconds or decrease numberOfSamples');
    }
    const cacheKey = audioData.resultId +
        frame +
        fps +
        numberOfSamples +
        'waveform' +
        dataOffsetInSeconds;
    if (cache[cacheKey]) {
        return cache[cacheKey];
    }
    const time = frame / fps;
    const startTimeInSeconds = time - windowInSeconds / 2;
    return (0, get_waveform_portion_1.getWaveformPortion)({
        audioData,
        startTimeInSeconds,
        durationInSeconds: windowInSeconds,
        numberOfSamples,
        outputRange: 'minus-one-to-one',
        channel,
        dataOffsetInSeconds,
        normalize,
    });
};
const visualizeAudioWaveform = (parameters) => {
    const data = visualizeAudioWaveformFrame(parameters);
    return data.map((value) => value.amplitude);
};
exports.visualizeAudioWaveform = visualizeAudioWaveform;
