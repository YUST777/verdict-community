"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsMap = void 0;
const api_key_1 = require("./api-key");
const audio_bitrate_1 = require("./audio-bitrate");
const audio_codec_1 = require("./audio-codec");
const binaries_directory_1 = require("./binaries-directory");
const chrome_mode_1 = require("./chrome-mode");
const color_space_1 = require("./color-space");
const crf_1 = require("./crf");
const delete_after_1 = require("./delete-after");
const disallow_parallel_encoding_1 = require("./disallow-parallel-encoding");
const encoding_buffer_size_1 = require("./encoding-buffer-size");
const encoding_max_rate_1 = require("./encoding-max-rate");
const enforce_audio_1 = require("./enforce-audio");
const for_seamless_aac_concatenation_1 = require("./for-seamless-aac-concatenation");
const hardware_acceleration_1 = require("./hardware-acceleration");
const image_sequence_pattern_1 = require("./image-sequence-pattern");
const jpeg_quality_1 = require("./jpeg-quality");
const license_key_1 = require("./license-key");
const log_level_1 = require("./log-level");
const mute_1 = require("./mute");
const number_of_gif_loops_1 = require("./number-of-gif-loops");
const offthreadvideo_cache_size_1 = require("./offthreadvideo-cache-size");
const offthreadvideo_threads_1 = require("./offthreadvideo-threads");
const on_browser_download_1 = require("./on-browser-download");
const prefer_lossless_1 = require("./prefer-lossless");
const repro_1 = require("./repro");
const scale_1 = require("./scale");
const separate_audio_1 = require("./separate-audio");
const throw_if_site_exists_1 = require("./throw-if-site-exists");
const timeout_1 = require("./timeout");
const video_bitrate_1 = require("./video-bitrate");
const video_cache_size_1 = require("./video-cache-size");
const video_codec_1 = require("./video-codec");
const x264_preset_1 = require("./x264-preset");
exports.optionsMap = {
    renderMedia: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        videoBitrate: video_bitrate_1.videoBitrateOption,
        numberOfGifLoops: number_of_gif_loops_1.numberOfGifLoopsOption,
        repro: repro_1.reproOption,
        x264Preset: x264_preset_1.x264Option,
        audioBitrate: audio_bitrate_1.audioBitrateOption,
        colorSpace: color_space_1.colorSpaceOption,
        codec: video_codec_1.videoCodecOption,
        disallowParallelEncoding: disallow_parallel_encoding_1.disallowParallelEncodingOption,
        jpegQuality: jpeg_quality_1.jpegQualityOption,
        encodingMaxRate: encoding_max_rate_1.encodingMaxRateOption,
        encodingBufferSize: encoding_buffer_size_1.encodingBufferSizeOption,
        muted: mute_1.mutedOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        binariesDirectory: binaries_directory_1.binariesDirectoryOption,
        forSeamlessAacConcatenation: for_seamless_aac_concatenation_1.forSeamlessAacConcatenationOption,
        separateAudioTo: separate_audio_1.separateAudioOption,
        audioCodec: audio_codec_1.audioCodecOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        hardwareAcceleration: hardware_acceleration_1.hardwareAccelerationOption,
        chromeMode: chrome_mode_1.chromeModeOption,
        licenseKey: license_key_1.licenseKeyOption,
    },
    stitchFramesToVideo: {
        separateAudioTo: separate_audio_1.separateAudioOption,
        hardwareAcceleration: hardware_acceleration_1.hardwareAccelerationOption,
    },
    renderStill: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        jpegQuality: jpeg_quality_1.jpegQualityOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        binariesDirectory: binaries_directory_1.binariesDirectoryOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        chromeMode: chrome_mode_1.chromeModeOption,
        apiKey: api_key_1.apiKeyOption,
        licenseKey: license_key_1.licenseKeyOption,
    },
    getCompositions: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        binariesDirectory: binaries_directory_1.binariesDirectoryOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        chromeMode: chrome_mode_1.chromeModeOption,
    },
    selectComposition: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        binariesDirectory: binaries_directory_1.binariesDirectoryOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        chromeMode: chrome_mode_1.chromeModeOption,
    },
    renderFrames: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        forSeamlessAacConcatenation: for_seamless_aac_concatenation_1.forSeamlessAacConcatenationOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        jpegQuality: jpeg_quality_1.jpegQualityOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        binariesDirectory: binaries_directory_1.binariesDirectoryOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        chromeMode: chrome_mode_1.chromeModeOption,
        imageSequencePattern: image_sequence_pattern_1.imageSequencePatternOption,
    },
    renderMediaOnLambda: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        videoBitrate: video_bitrate_1.videoBitrateOption,
        numberOfGifLoops: number_of_gif_loops_1.numberOfGifLoopsOption,
        preferLossless: prefer_lossless_1.preferLosslessAudioOption,
        audioBitrate: audio_bitrate_1.audioBitrateOption,
        deleteAfter: delete_after_1.deleteAfterOption,
        x264Preset: x264_preset_1.x264Option,
        encodingMaxRate: encoding_max_rate_1.encodingMaxRateOption,
        encodingBufferSize: encoding_buffer_size_1.encodingBufferSizeOption,
        colorSpace: color_space_1.colorSpaceOption,
        muted: mute_1.mutedOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        apiKey: api_key_1.apiKeyOption,
        licenseKey: license_key_1.licenseKeyOption,
    },
    renderStillOnLambda: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        jpegQuality: jpeg_quality_1.jpegQualityOption,
        logLevel: log_level_1.logLevelOption,
        deleteAfter: delete_after_1.deleteAfterOption,
        scale: scale_1.scaleOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        apiKey: api_key_1.apiKeyOption,
        licenseKey: license_key_1.licenseKeyOption,
    },
    getCompositionsOnLambda: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        logLevel: log_level_1.logLevelOption,
        timeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
    },
    renderMediaOnCloudRun: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        numberOfGifLoops: number_of_gif_loops_1.numberOfGifLoopsOption,
        preferLossless: prefer_lossless_1.preferLosslessAudioOption,
        colorSpace: color_space_1.colorSpaceOption,
        audioBitrate: audio_bitrate_1.audioBitrateOption,
        videoBitrate: video_bitrate_1.videoBitrateOption,
        x264Preset: x264_preset_1.x264Option,
        encodingMaxRate: encoding_max_rate_1.encodingMaxRateOption,
        encodingBufferSize: encoding_buffer_size_1.encodingBufferSizeOption,
        muted: mute_1.mutedOption,
        logLevel: log_level_1.logLevelOption,
        delayRenderTimeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
        enforceAudioTrack: enforce_audio_1.enforceAudioOption,
        scale: scale_1.scaleOption,
        crf: crf_1.crfOption,
        jpegQuality: jpeg_quality_1.jpegQualityOption,
    },
    renderStillOnCloudRun: {
        mediaCacheSizeInBytes: video_cache_size_1.mediaCacheSizeInBytesOption,
        offthreadVideoCacheSizeInBytes: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
        offthreadVideoThreads: offthreadvideo_threads_1.offthreadVideoThreadsOption,
        logLevel: log_level_1.logLevelOption,
        scale: scale_1.scaleOption,
        jpegQuality: jpeg_quality_1.jpegQualityOption,
        delayRenderTimeoutInMilliseconds: timeout_1.delayRenderTimeoutInMillisecondsOption,
    },
    ensureBrowser: {
        logLevel: log_level_1.logLevelOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        chromeMode: chrome_mode_1.chromeModeOption,
    },
    openBrowser: {
        logLevel: log_level_1.logLevelOption,
        onBrowserDownload: on_browser_download_1.onBrowserDownloadOption,
        chromeMode: chrome_mode_1.chromeModeOption,
    },
    deploySiteLambda: {
        logLevel: log_level_1.logLevelOption,
        throwIfSiteExists: throw_if_site_exists_1.throwIfSiteExistsOption,
    },
    deploySiteCloudRun: {
        logLevel: log_level_1.logLevelOption,
    },
};
