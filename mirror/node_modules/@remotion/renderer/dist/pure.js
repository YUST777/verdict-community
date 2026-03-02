"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoReactAPIs = void 0;
const codec_supports_media_1 = require("./codec-supports-media");
const get_duration_from_frame_range_1 = require("./get-duration-from-frame-range");
const get_extension_from_codec_1 = require("./get-extension-from-codec");
const get_extension_of_filename_1 = require("./get-extension-of-filename");
const is_audio_codec_1 = require("./is-audio-codec");
const validate_output_filename_1 = require("./validate-output-filename");
exports.NoReactAPIs = {
    getExtensionOfFilename: get_extension_of_filename_1.getExtensionOfFilename,
    getFileExtensionFromCodec: get_extension_from_codec_1.getFileExtensionFromCodec,
    validateOutputFilename: validate_output_filename_1.validateOutputFilename,
    getFramesToRender: get_duration_from_frame_range_1.getFramesToRender,
    codecSupportsMedia: codec_supports_media_1.codecSupportsMedia,
    isAudioCodec: is_audio_codec_1.isAudioCodec,
};
