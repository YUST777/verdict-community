"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessAudioTrack = void 0;
const flatten_volume_array_1 = require("./assets/flatten-volume-array");
const get_audio_channels_1 = require("./assets/get-audio-channels");
const call_ffmpeg_1 = require("./call-ffmpeg");
const ffmpeg_filter_file_1 = require("./ffmpeg-filter-file");
const logger_1 = require("./logger");
const p_limit_1 = require("./p-limit");
const parse_ffmpeg_progress_1 = require("./parse-ffmpeg-progress");
const resolve_asset_src_1 = require("./resolve-asset-src");
const sample_rate_1 = require("./sample-rate");
const stringify_ffmpeg_filter_1 = require("./stringify-ffmpeg-filter");
const truthy_1 = require("./truthy");
const preprocessAudioTrackUnlimited = async ({ outName, asset, fps, downloadMap, indent, logLevel, binariesDirectory, cancelSignal, onProgress, chunkLengthInSeconds, trimLeftOffset, trimRightOffset, forSeamlessAacConcatenation, audioStreamIndex, }) => {
    var _a;
    const { channels, duration, startTime } = await (0, get_audio_channels_1.getAudioChannelsAndDuration)({
        downloadMap,
        src: (0, resolve_asset_src_1.resolveAssetSrc)(asset.src),
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal,
        audioStreamIndex,
    });
    const filter = (0, stringify_ffmpeg_filter_1.stringifyFfmpegFilter)({
        asset,
        fps,
        channels,
        assetDuration: duration,
        chunkLengthInSeconds,
        trimLeftOffset,
        trimRightOffset,
        forSeamlessAacConcatenation,
        volume: (0, flatten_volume_array_1.flattenVolumeArray)(asset.volume),
        indent,
        logLevel,
        presentationTimeOffsetInSeconds: startTime !== null && startTime !== void 0 ? startTime : 0,
    });
    if (filter === null) {
        return null;
    }
    const { cleanup, file } = await (0, ffmpeg_filter_file_1.makeFfmpegFilterFile)(filter, downloadMap);
    const args = [
        ['-hide_banner'],
        ['-i', (0, resolve_asset_src_1.resolveAssetSrc)(asset.src)],
        audioStreamIndex ? ['-map', `0:a:${audioStreamIndex}`] : [],
        ['-ac', '2'],
        file ? ['-filter_script:a', file] : null,
        ['-c:a', 'pcm_s16le'],
        ['-ar', String(sample_rate_1.DEFAULT_SAMPLE_RATE)],
        ['-y', outName],
    ]
        .flat(2)
        .filter(truthy_1.truthy);
    logger_1.Log.verbose({ indent, logLevel }, 'Preprocessing audio track:', JSON.stringify(args.join(' ')), 'Filter:', filter.filter);
    const startTimestamp = Date.now();
    const task = (0, call_ffmpeg_1.callFf)({
        bin: 'ffmpeg',
        args,
        indent,
        logLevel,
        binariesDirectory,
        cancelSignal,
    });
    (_a = task.stderr) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
        const utf8 = data.toString('utf8');
        const parsed = (0, parse_ffmpeg_progress_1.parseFfmpegProgress)(utf8, fps);
        if (parsed !== undefined) {
            onProgress((parsed - filter.actualTrimLeft * fps) / (chunkLengthInSeconds * fps));
        }
    });
    await task;
    logger_1.Log.verbose({ indent, logLevel }, 'Preprocessed audio track', `${Date.now() - startTimestamp}ms`);
    cleanup();
    return { outName, filter };
};
const limit = (0, p_limit_1.pLimit)(2);
const preprocessAudioTrack = (options) => {
    return limit(preprocessAudioTrackUnlimited, options);
};
exports.preprocessAudioTrack = preprocessAudioTrack;
