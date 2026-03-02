"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoDecoderConfigWithHardwareAcceleration = void 0;
const getVideoDecoderConfigWithHardwareAcceleration = async (config) => {
    if (typeof VideoDecoder === 'undefined') {
        return null;
    }
    const hardware = {
        ...config,
        hardwareAcceleration: 'prefer-hardware',
    };
    if ((await VideoDecoder.isConfigSupported(hardware)).supported) {
        return hardware;
    }
    const software = {
        ...config,
        hardwareAcceleration: 'prefer-software',
    };
    if ((await VideoDecoder.isConfigSupported(software)).supported) {
        return software;
    }
    return null;
};
exports.getVideoDecoderConfigWithHardwareAcceleration = getVideoDecoderConfigWithHardwareAcceleration;
