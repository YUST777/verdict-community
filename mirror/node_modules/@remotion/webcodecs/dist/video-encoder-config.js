"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoEncoderConfig = void 0;
const browser_quirks_1 = require("./browser-quirks");
const get_codec_string_1 = require("./get-codec-string");
const getVideoEncoderConfig = async ({ codec, height, width, fps, }) => {
    if (typeof VideoEncoder === 'undefined') {
        return null;
    }
    const config = {
        codec: (0, get_codec_string_1.getCodecStringForEncoder)({ codec, fps, height, width }),
        height,
        width,
        bitrate: (0, browser_quirks_1.isSafari)() ? 3000000 : undefined,
        bitrateMode: codec === 'vp9' && !(0, browser_quirks_1.isSafari)() ? 'quantizer' : undefined,
        framerate: fps ?? undefined,
    };
    const hardware = {
        ...config,
        hardwareAcceleration: 'prefer-hardware',
    };
    if ((await VideoEncoder.isConfigSupported(hardware)).supported) {
        return hardware;
    }
    const software = {
        ...config,
        hardwareAcceleration: 'prefer-software',
    };
    if ((await VideoEncoder.isConfigSupported(software)).supported) {
        return software;
    }
    return null;
};
exports.getVideoEncoderConfig = getVideoEncoderConfig;
