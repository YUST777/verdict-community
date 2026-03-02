"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allOptions = void 0;
const api_key_1 = require("./api-key");
const ask_ai_1 = require("./ask-ai");
const audio_bitrate_1 = require("./audio-bitrate");
const audio_codec_1 = require("./audio-codec");
const beep_on_finish_1 = require("./beep-on-finish");
const benchmark_concurrencies_1 = require("./benchmark-concurrencies");
const binaries_directory_1 = require("./binaries-directory");
const browser_1 = require("./browser");
const browser_executable_1 = require("./browser-executable");
const bundle_cache_1 = require("./bundle-cache");
const chrome_mode_1 = require("./chrome-mode");
const color_space_1 = require("./color-space");
const concurrency_1 = require("./concurrency");
const config_1 = require("./config");
const crf_1 = require("./crf");
const cross_site_isolation_1 = require("./cross-site-isolation");
const dark_mode_1 = require("./dark-mode");
const delete_after_1 = require("./delete-after");
const disable_git_source_1 = require("./disable-git-source");
const disable_web_security_1 = require("./disable-web-security");
const disallow_parallel_encoding_1 = require("./disallow-parallel-encoding");
const enable_lambda_insights_1 = require("./enable-lambda-insights");
const enable_multiprocess_on_linux_1 = require("./enable-multiprocess-on-linux");
const encoding_buffer_size_1 = require("./encoding-buffer-size");
const encoding_max_rate_1 = require("./encoding-max-rate");
const enforce_audio_1 = require("./enforce-audio");
const env_file_1 = require("./env-file");
const every_nth_frame_1 = require("./every-nth-frame");
const experimental_client_side_rendering_1 = require("./experimental-client-side-rendering");
const experimental_visual_mode_1 = require("./experimental-visual-mode");
const folder_expiry_1 = require("./folder-expiry");
const for_seamless_aac_concatenation_1 = require("./for-seamless-aac-concatenation");
const force_new_studio_1 = require("./force-new-studio");
const frames_1 = require("./frames");
const gl_1 = require("./gl");
const hardware_acceleration_1 = require("./hardware-acceleration");
const headless_1 = require("./headless");
const ignore_certificate_errors_1 = require("./ignore-certificate-errors");
const image_sequence_1 = require("./image-sequence");
const image_sequence_pattern_1 = require("./image-sequence-pattern");
const ipv4_1 = require("./ipv4");
const is_production_1 = require("./is-production");
const jpeg_quality_1 = require("./jpeg-quality");
const keyboard_shortcuts_1 = require("./keyboard-shortcuts");
const latency_hint_1 = require("./latency-hint");
const license_key_1 = require("./license-key");
const log_level_1 = require("./log-level");
const metadata_1 = require("./metadata");
const mute_1 = require("./mute");
const no_open_1 = require("./no-open");
const number_of_gif_loops_1 = require("./number-of-gif-loops");
const number_of_shared_audio_tags_1 = require("./number-of-shared-audio-tags");
const offthreadvideo_cache_size_1 = require("./offthreadvideo-cache-size");
const offthreadvideo_threads_1 = require("./offthreadvideo-threads");
const on_browser_download_1 = require("./on-browser-download");
const out_dir_1 = require("./out-dir");
const override_duration_1 = require("./override-duration");
const override_fps_1 = require("./override-fps");
const override_height_1 = require("./override-height");
const override_width_1 = require("./override-width");
const overwrite_1 = require("./overwrite");
const package_manager_1 = require("./package-manager");
const pixel_format_1 = require("./pixel-format");
const port_1 = require("./port");
const prefer_lossless_1 = require("./prefer-lossless");
const props_1 = require("./props");
const prores_profile_1 = require("./prores-profile");
const public_dir_1 = require("./public-dir");
const public_license_key_1 = require("./public-license-key");
const public_path_1 = require("./public-path");
const repro_1 = require("./repro");
const rspack_1 = require("./rspack");
const runs_1 = require("./runs");
const scale_1 = require("./scale");
const separate_audio_1 = require("./separate-audio");
const still_frame_1 = require("./still-frame");
const still_image_format_1 = require("./still-image-format");
const throw_if_site_exists_1 = require("./throw-if-site-exists");
const timeout_1 = require("./timeout");
const user_agent_1 = require("./user-agent");
const version_flag_1 = require("./version-flag");
const video_bitrate_1 = require("./video-bitrate");
const video_cache_size_1 = require("./video-cache-size");
const video_codec_1 = require("./video-codec");
const video_image_format_1 = require("./video-image-format");
const webhook_custom_data_1 = require("./webhook-custom-data");
const webpack_poll_1 = require("./webpack-poll");
const x264_preset_1 = require("./x264-preset");
exports.allOptions = {
    audioCodecOption: audio_codec_1.audioCodecOption,
    benchmarkConcurrenciesOption: benchmark_concurrencies_1.benchmarkConcurrenciesOption,
    browserExecutableOption: browser_executable_1.browserExecutableOption,
    concurrencyOption: concurrency_1.concurrencyOption,
    scaleOption: scale_1.scaleOption,
    crfOption: crf_1.crfOption,
    jpegQualityOption: jpeg_quality_1.jpegQualityOption,
    videoBitrateOption: video_bitrate_1.videoBitrateOption,
    audioBitrateOption: audio_bitrate_1.audioBitrateOption,
    enforceAudioOption: enforce_audio_1.enforceAudioOption,
    everyNthFrameOption: every_nth_frame_1.everyNthFrameOption,
    mutedOption: mute_1.mutedOption,
    videoCodecOption: video_codec_1.videoCodecOption,
    offthreadVideoCacheSizeInBytesOption: offthreadvideo_cache_size_1.offthreadVideoCacheSizeInBytesOption,
    offthreadVideoThreadsOption: offthreadvideo_threads_1.offthreadVideoThreadsOption,
    webhookCustomDataOption: webhook_custom_data_1.webhookCustomDataOption,
    colorSpaceOption: color_space_1.colorSpaceOption,
    deleteAfterOption: delete_after_1.deleteAfterOption,
    disableWebSecurityOption: disable_web_security_1.disableWebSecurityOption,
    disallowParallelEncodingOption: disallow_parallel_encoding_1.disallowParallelEncodingOption,
    folderExpiryOption: folder_expiry_1.folderExpiryOption,
    enableMultiprocessOnLinuxOption: enable_multiprocess_on_linux_1.enableMultiprocessOnLinuxOption,
    glOption: gl_1.glOption,
    enableLambdaInsights: enable_lambda_insights_1.enableLambdaInsights,
    encodingMaxRateOption: encoding_max_rate_1.encodingMaxRateOption,
    encodingBufferSizeOption: encoding_buffer_size_1.encodingBufferSizeOption,
    beepOnFinishOption: beep_on_finish_1.beepOnFinishOption,
    numberOfGifLoopsOption: number_of_gif_loops_1.numberOfGifLoopsOption,
    reproOption: repro_1.reproOption,
    runsOption: runs_1.runsOption,
    noOpenOption: no_open_1.noOpenOption,
    pixelFormatOption: pixel_format_1.pixelFormatOption,
    preferLosslessOption: prefer_lossless_1.preferLosslessAudioOption,
    proResProfileOption: prores_profile_1.proResProfileOption,
    x264Option: x264_preset_1.x264Option,
    logLevelOption: log_level_1.logLevelOption,
    delayRenderTimeoutInMillisecondsOption: timeout_1.delayRenderTimeoutInMillisecondsOption,
    headlessOption: headless_1.headlessOption,
    overwriteOption: overwrite_1.overwriteOption,
    binariesDirectoryOption: binaries_directory_1.binariesDirectoryOption,
    forSeamlessAacConcatenationOption: for_seamless_aac_concatenation_1.forSeamlessAacConcatenationOption,
    separateAudioOption: separate_audio_1.separateAudioOption,
    publicPathOption: public_path_1.publicPathOption,
    publicDirOption: public_dir_1.publicDirOption,
    onBrowserDownloadOption: on_browser_download_1.onBrowserDownloadOption,
    throwIfSiteExistsOption: throw_if_site_exists_1.throwIfSiteExistsOption,
    disableGitSourceOption: disable_git_source_1.disableGitSourceOption,
    metadataOption: metadata_1.metadataOption,
    hardwareAccelerationOption: hardware_acceleration_1.hardwareAccelerationOption,
    chromeModeOption: chrome_mode_1.chromeModeOption,
    apiKeyOption: api_key_1.apiKeyOption,
    licenseKeyOption: license_key_1.licenseKeyOption,
    audioLatencyHintOption: latency_hint_1.audioLatencyHintOption,
    enableCrossSiteIsolationOption: cross_site_isolation_1.enableCrossSiteIsolationOption,
    ignoreCertificateErrorsOption: ignore_certificate_errors_1.ignoreCertificateErrorsOption,
    imageSequencePatternOption: image_sequence_pattern_1.imageSequencePatternOption,
    mediaCacheSizeInBytesOption: video_cache_size_1.mediaCacheSizeInBytesOption,
    darkModeOption: dark_mode_1.darkModeOption,
    publicLicenseKeyOption: public_license_key_1.publicLicenseKeyOption,
    isProductionOption: is_production_1.isProductionOption,
    askAIOption: ask_ai_1.askAIOption,
    experimentalClientSideRenderingOption: experimental_client_side_rendering_1.experimentalClientSideRenderingOption,
    experimentalVisualModeOption: experimental_visual_mode_1.experimentalVisualModeOption,
    keyboardShortcutsOption: keyboard_shortcuts_1.keyboardShortcutsOption,
    framesOption: frames_1.framesOption,
    forceNewStudioOption: force_new_studio_1.forceNewStudioOption,
    numberOfSharedAudioTagsOption: number_of_shared_audio_tags_1.numberOfSharedAudioTagsOption,
    ipv4Option: ipv4_1.ipv4Option,
    stillImageFormatOption: still_image_format_1.stillImageFormatOption,
    userAgentOption: user_agent_1.userAgentOption,
    videoImageFormatOption: video_image_format_1.videoImageFormatOption,
    overrideHeightOption: override_height_1.overrideHeightOption,
    overrideWidthOption: override_width_1.overrideWidthOption,
    overrideFpsOption: override_fps_1.overrideFpsOption,
    overrideDurationOption: override_duration_1.overrideDurationOption,
    rspackOption: rspack_1.rspackOption,
    outDirOption: out_dir_1.outDirOption,
    packageManagerOption: package_manager_1.packageManagerOption,
    webpackPollOption: webpack_poll_1.webpackPollOption,
    stillFrameOption: still_frame_1.stillFrameOption,
    imageSequenceOption: image_sequence_1.imageSequenceOption,
    versionFlagOption: version_flag_1.versionFlagOption,
    bundleCacheOption: bundle_cache_1.bundleCacheOption,
    envFileOption: env_file_1.envFileOption,
    portOption: port_1.portOption,
    propsOption: props_1.propsOption,
    configOption: config_1.configOption,
    browserOption: browser_1.browserOption,
};
