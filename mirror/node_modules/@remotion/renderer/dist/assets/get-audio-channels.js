"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioChannelsAndDuration = exports.getAudioChannelsAndDurationWithoutCache = void 0;
const call_ffmpeg_1 = require("../call-ffmpeg");
const p_limit_1 = require("../p-limit");
const limit = (0, p_limit_1.pLimit)(1);
const getAudioChannelsAndDurationWithoutCache = async ({ src, indent, logLevel, binariesDirectory, cancelSignal, audioStreamIndex, }) => {
    const args = [
        ['-v', 'error'],
        ['-select_streams', audioStreamIndex ? `a:${audioStreamIndex}` : 'a:0'],
        [
            '-show_entries',
            'stream=channels:stream=start_time:format=duration:format=format_name',
        ],
        ['-of', 'default=nw=1'],
        [src],
    ]
        .reduce((acc, val) => acc.concat(val), [])
        .filter(Boolean);
    try {
        const task = await (0, call_ffmpeg_1.callFf)({
            bin: 'ffprobe',
            args,
            indent,
            logLevel,
            binariesDirectory,
            cancelSignal,
        });
        const channels = task.stdout.match(/channels=([0-9]+)/);
        const duration = task.stdout.match(/duration=([0-9.]+)/);
        const startTime = task.stdout.match(/start_time=([0-9.]+)/);
        const container = task.stdout.match(/format_name=([a-zA-Z0-9.]+)/);
        const isMP3 = container ? container[1] === 'mp3' : false;
        const result = {
            channels: channels ? parseInt(channels[1], 10) : 0,
            duration: duration ? parseFloat(duration[1]) : null,
            // We ignore the start time for MP3 because that is an inherent encoder thing
            // not in the sense that we want
            startTime: startTime ? (isMP3 ? 0 : parseFloat(startTime[1])) : null,
        };
        return result;
    }
    catch (err) {
        if (err.message.includes('This file cannot be read by `ffprobe`. Is it a valid multimedia file?')) {
            throw new Error('This file cannot be read by `ffprobe`. Is it a valid multimedia file?');
        }
        throw err;
    }
};
exports.getAudioChannelsAndDurationWithoutCache = getAudioChannelsAndDurationWithoutCache;
async function getAudioChannelsAndDurationUnlimited({ downloadMap, src, indent, logLevel, binariesDirectory, cancelSignal, audioStreamIndex, }) {
    const cacheKey = audioStreamIndex ? `${src}-${audioStreamIndex}` : src;
    if (downloadMap.durationOfAssetCache[cacheKey]) {
        return downloadMap.durationOfAssetCache[cacheKey];
    }
    const result = await (0, exports.getAudioChannelsAndDurationWithoutCache)({
        src,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal,
        audioStreamIndex,
    });
    downloadMap.durationOfAssetCache[cacheKey] = result;
    return result;
}
const getAudioChannelsAndDuration = ({ downloadMap, src, indent, logLevel, binariesDirectory, cancelSignal, audioStreamIndex, }) => {
    return limit(() => getAudioChannelsAndDurationUnlimited({
        downloadMap,
        src,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal,
        audioStreamIndex,
    }));
};
exports.getAudioChannelsAndDuration = getAudioChannelsAndDuration;
