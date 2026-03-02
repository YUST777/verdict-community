"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodecName = exports.hasSpecifiedUnsupportedHardwareQualifySettings = void 0;
const logger_1 = require("./logger");
const hasSpecifiedUnsupportedHardwareQualifySettings = ({ encodingMaxRate, encodingBufferSize, crf, }) => {
    if (encodingBufferSize !== null) {
        return 'encodingBufferSize';
    }
    if (encodingMaxRate !== null) {
        return 'encodingMaxRate';
    }
    if (crf !== null && typeof crf !== 'undefined') {
        return 'crf';
    }
    return null;
};
exports.hasSpecifiedUnsupportedHardwareQualifySettings = hasSpecifiedUnsupportedHardwareQualifySettings;
const getCodecName = ({ codec, encodingMaxRate, encodingBufferSize, crf, hardwareAcceleration, logLevel, indent, }) => {
    const preferredHwAcceleration = hardwareAcceleration === 'required' ||
        hardwareAcceleration === 'if-possible';
    const unsupportedQualityOption = (0, exports.hasSpecifiedUnsupportedHardwareQualifySettings)({
        encodingMaxRate,
        encodingBufferSize,
        crf,
    });
    if (hardwareAcceleration === 'required' && unsupportedQualityOption) {
        throw new Error(`When using hardware accelerated encoding, the option "${unsupportedQualityOption}" with hardware acceleration is not supported. Disable hardware accelerated encoding or use "if-possible" instead.`);
    }
    const warnAboutDisabledHardwareAcceleration = () => {
        if (hardwareAcceleration === 'if-possible' && unsupportedQualityOption) {
            logger_1.Log.warn({ indent, logLevel }, `${indent ? '' : '\n'}Hardware accelerated encoding disabled - "${unsupportedQualityOption}" option is not supported with hardware acceleration`);
        }
    };
    if (codec === 'prores') {
        if (preferredHwAcceleration &&
            process.platform === 'darwin' &&
            !unsupportedQualityOption) {
            return { encoderName: 'prores_videotoolbox', hardwareAccelerated: true };
        }
        warnAboutDisabledHardwareAcceleration();
        return { encoderName: 'prores_ks', hardwareAccelerated: false };
    }
    if (codec === 'h264') {
        if (preferredHwAcceleration &&
            process.platform === 'darwin' &&
            !unsupportedQualityOption) {
            return { encoderName: 'h264_videotoolbox', hardwareAccelerated: true };
        }
        warnAboutDisabledHardwareAcceleration();
        return { encoderName: 'libx264', hardwareAccelerated: false };
    }
    if (codec === 'h265') {
        if (preferredHwAcceleration &&
            process.platform === 'darwin' &&
            !unsupportedQualityOption) {
            return { encoderName: 'hevc_videotoolbox', hardwareAccelerated: true };
        }
        warnAboutDisabledHardwareAcceleration();
        return { encoderName: 'libx265', hardwareAccelerated: false };
    }
    if (codec === 'vp8') {
        return { encoderName: 'libvpx', hardwareAccelerated: false };
    }
    if (codec === 'vp9') {
        return { encoderName: 'libvpx-vp9', hardwareAccelerated: false };
    }
    if (codec === 'gif') {
        return { encoderName: 'gif', hardwareAccelerated: false };
    }
    if (codec === 'mp3') {
        return null;
    }
    if (codec === 'aac') {
        return null;
    }
    if (codec === 'wav') {
        return null;
    }
    if (codec === 'h264-mkv') {
        return { encoderName: 'libx264', hardwareAccelerated: false };
    }
    if (codec === 'h264-ts') {
        return { encoderName: 'libx264', hardwareAccelerated: false };
    }
    throw new Error(`Could not get codec for ${codec}`);
};
exports.getCodecName = getCodecName;
