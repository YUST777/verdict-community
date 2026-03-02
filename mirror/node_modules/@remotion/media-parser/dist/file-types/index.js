"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFileType = void 0;
const bmp_1 = require("./bmp");
const detect_file_type_1 = require("./detect-file-type");
const gif_1 = require("./gif");
const jpeg_1 = require("./jpeg");
const pdf_1 = require("./pdf");
const png_1 = require("./png");
const webp_1 = require("./webp");
const detectFileType = (data) => {
    if ((0, detect_file_type_1.isRiffWave)(data)) {
        return { type: 'wav' };
    }
    if ((0, detect_file_type_1.isRiffAvi)(data)) {
        return { type: 'riff' };
    }
    if ((0, detect_file_type_1.isAac)(data)) {
        return { type: 'aac' };
    }
    if ((0, detect_file_type_1.isFlac)(data)) {
        return { type: 'flac' };
    }
    if ((0, detect_file_type_1.isM3u)(data)) {
        return { type: 'm3u' };
    }
    const webp = (0, webp_1.isWebp)(data);
    if (webp) {
        return webp;
    }
    if ((0, detect_file_type_1.isWebm)(data)) {
        return { type: 'webm' };
    }
    if ((0, detect_file_type_1.isIsoBaseMedia)(data)) {
        return { type: 'iso-base-media' };
    }
    if ((0, detect_file_type_1.isTransportStream)(data)) {
        return { type: 'transport-stream' };
    }
    if ((0, detect_file_type_1.isMp3)(data)) {
        return { type: 'mp3' };
    }
    const gif = (0, gif_1.isGif)(data);
    if (gif) {
        return gif;
    }
    const png = (0, png_1.isPng)(data);
    if (png) {
        return png;
    }
    const pdf = (0, pdf_1.isPdf)(data);
    if (pdf) {
        return pdf;
    }
    const bmp = (0, bmp_1.isBmp)(data);
    if (bmp) {
        return bmp;
    }
    const jpeg = (0, jpeg_1.isJpeg)(data);
    if (jpeg) {
        return jpeg;
    }
    return { type: 'unknown' };
};
exports.detectFileType = detectFileType;
