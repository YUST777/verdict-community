"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveformSamples = void 0;
const normalize_data_1 = require("./normalize-data");
const getWaveformSamples = ({ audioBuffer, numberOfSamples, outputRange, normalize, }) => {
    const blockSize = Math.floor(audioBuffer.length / numberOfSamples); // the number of samples in each subdivision
    if (blockSize === 0) {
        return [];
    }
    const filteredData = [];
    for (let i = 0; i < numberOfSamples; i++) {
        const blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(audioBuffer[blockStart + j]); // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    if (normalize) {
        if (outputRange === 'minus-one-to-one') {
            return (0, normalize_data_1.normalizeData)(filteredData).map((n, i) => {
                if (i % 2 === 0) {
                    return n * -1;
                }
                return n;
            });
        }
        return (0, normalize_data_1.normalizeData)(filteredData);
    }
    if (outputRange === 'minus-one-to-one') {
        return filteredData.map((n, i) => {
            if (i % 2 === 0) {
                return n * -1;
            }
            return n;
        });
    }
    return filteredData;
};
exports.getWaveformSamples = getWaveformSamples;
