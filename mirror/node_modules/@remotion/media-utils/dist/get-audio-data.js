"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioData = void 0;
const fetch_with_cors_catch_1 = require("./fetch-with-cors-catch");
const is_remote_asset_1 = require("./is-remote-asset");
const p_limit_1 = require("./p-limit");
const metadataCache = {};
const limit = (0, p_limit_1.pLimit)(3);
const fn = async (src, options) => {
    var _a;
    if (metadataCache[src]) {
        return metadataCache[src];
    }
    if (typeof document === 'undefined') {
        throw new Error('getAudioData() is only available in the browser.');
    }
    const audioContext = new AudioContext({
        sampleRate: (_a = options === null || options === void 0 ? void 0 : options.sampleRate) !== null && _a !== void 0 ? _a : 48000,
    });
    const response = await (0, fetch_with_cors_catch_1.fetchWithCorsCatch)(src);
    if (!response.ok) {
        throw new Error(`Failed to fetch audio data from ${src}: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const wave = await audioContext.decodeAudioData(arrayBuffer);
    const channelWaveforms = new Array(wave.numberOfChannels)
        .fill(true)
        .map((_, channel) => {
        return wave.getChannelData(channel);
    });
    const metadata = {
        channelWaveforms,
        sampleRate: wave.sampleRate,
        durationInSeconds: wave.duration,
        numberOfChannels: wave.numberOfChannels,
        resultId: String(Math.random()),
        isRemote: (0, is_remote_asset_1.isRemoteAsset)(src),
    };
    metadataCache[src] = metadata;
    return metadata;
};
/*
 * @description Takes an audio or video src, loads it and returns data and metadata for the specified source.
 * @see [Documentation](https://remotion.dev/docs/get-audio-data)
 */
const getAudioData = (src, options) => {
    return limit(fn, src, options);
};
exports.getAudioData = getAudioData;
