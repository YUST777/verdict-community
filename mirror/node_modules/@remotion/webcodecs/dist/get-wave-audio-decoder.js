"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveAudioDecoder = void 0;
const getBytesPerSample = (sampleFormat) => {
    if (sampleFormat === 's16') {
        return 2;
    }
    if (sampleFormat === 's24') {
        return 4;
    }
    throw new Error(`Unsupported sample format: ${sampleFormat}`);
};
function uint8_24le_to_uint32(u8) {
    if (u8.length % 3 !== 0) {
        throw new Error('Input length must be a multiple of 3');
    }
    const count = u8.length / 3;
    const out = new Uint32Array(count);
    let j = 0;
    for (let i = 0; i < count; i++) {
        const b0 = u8[j++];
        const b1 = u8[j++];
        const b2 = u8[j++];
        out[i] = (b0 | (b1 << 8) | (b2 << 16)) << 8;
    }
    return out;
}
const getAudioData = (audioSample) => {
    if (audioSample instanceof EncodedAudioChunk) {
        const data = new Uint8Array(audioSample.byteLength);
        audioSample.copyTo(data);
        return data;
    }
    return audioSample.data;
};
const getWaveAudioDecoder = ({ onFrame, config, sampleFormat, ioSynchronizer, onError, }) => {
    const processSample = async (audioSample) => {
        const bytesPerSample = getBytesPerSample(sampleFormat);
        const rawData = getAudioData(audioSample);
        const data = sampleFormat === 's24' && rawData instanceof Uint8Array
            ? uint8_24le_to_uint32(rawData)
            : rawData;
        const numberOfFrames = data.byteLength / bytesPerSample / config.numberOfChannels;
        const audioData = new AudioData({
            // @ts-expect-error
            data,
            format: sampleFormat === 's16' ? 's16' : 's32',
            numberOfChannels: config.numberOfChannels,
            numberOfFrames,
            sampleRate: config.sampleRate,
            timestamp: audioSample.timestamp,
        });
        try {
            await onFrame(audioData);
        }
        catch (err) {
            audioData.close();
            onError(err);
        }
    };
    let lastReset = null;
    let mostRecentSampleInput = null;
    return {
        close() {
            return Promise.resolve();
        },
        decode(audioSample) {
            mostRecentSampleInput = audioSample.timestamp;
            return processSample(audioSample);
        },
        flush: () => Promise.resolve(),
        waitForQueueToBeLessThan: ioSynchronizer.waitForQueueSize,
        reset: () => {
            lastReset = Date.now();
        },
        checkReset: () => ({
            wasReset: () => lastReset !== null && lastReset > Date.now(),
        }),
        getMostRecentSampleInput: () => mostRecentSampleInput,
    };
};
exports.getWaveAudioDecoder = getWaveAudioDecoder;
