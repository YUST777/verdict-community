"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAudioWaveform = exports.visualizeAudio = exports.useWindowedAudioData = exports.useAudioData = exports.getWaveformPortion = exports.getVideoMetadata = exports.getImageDimensions = exports.getAudioDurationInSeconds = exports.getAudioDuration = exports.getAudioData = exports.createSmoothSvgPath = exports.audioBufferToDataUrl = void 0;
const audio_url_helpers_1 = require("./audio-buffer/audio-url-helpers");
Object.defineProperty(exports, "audioBufferToDataUrl", { enumerable: true, get: function () { return audio_url_helpers_1.audioBufferToDataUrl; } });
const create_smooth_svg_path_1 = require("./create-smooth-svg-path");
Object.defineProperty(exports, "createSmoothSvgPath", { enumerable: true, get: function () { return create_smooth_svg_path_1.createSmoothSvgPath; } });
const get_audio_data_1 = require("./get-audio-data");
Object.defineProperty(exports, "getAudioData", { enumerable: true, get: function () { return get_audio_data_1.getAudioData; } });
const get_audio_duration_in_seconds_1 = require("./get-audio-duration-in-seconds");
Object.defineProperty(exports, "getAudioDuration", { enumerable: true, get: function () { return get_audio_duration_in_seconds_1.getAudioDuration; } });
Object.defineProperty(exports, "getAudioDurationInSeconds", { enumerable: true, get: function () { return get_audio_duration_in_seconds_1.getAudioDurationInSeconds; } });
const get_image_dimensions_1 = require("./get-image-dimensions");
Object.defineProperty(exports, "getImageDimensions", { enumerable: true, get: function () { return get_image_dimensions_1.getImageDimensions; } });
const get_video_metadata_1 = require("./get-video-metadata");
Object.defineProperty(exports, "getVideoMetadata", { enumerable: true, get: function () { return get_video_metadata_1.getVideoMetadata; } });
const get_waveform_portion_1 = require("./get-waveform-portion");
Object.defineProperty(exports, "getWaveformPortion", { enumerable: true, get: function () { return get_waveform_portion_1.getWaveformPortion; } });
__exportStar(require("./types"), exports);
const use_audio_data_1 = require("./use-audio-data");
Object.defineProperty(exports, "useAudioData", { enumerable: true, get: function () { return use_audio_data_1.useAudioData; } });
const use_windowed_audio_data_1 = require("./use-windowed-audio-data");
Object.defineProperty(exports, "useWindowedAudioData", { enumerable: true, get: function () { return use_windowed_audio_data_1.useWindowedAudioData; } });
const visualize_audio_1 = require("./visualize-audio");
Object.defineProperty(exports, "visualizeAudio", { enumerable: true, get: function () { return visualize_audio_1.visualizeAudio; } });
const visualize_audio_waveform_1 = require("./visualize-audio-waveform");
Object.defineProperty(exports, "visualizeAudioWaveform", { enumerable: true, get: function () { return visualize_audio_waveform_1.visualizeAudioWaveform; } });
