"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFrames = void 0;
const media_parser_1 = require("@remotion/media-parser");
const internal_extract_frames_1 = require("./internal-extract-frames");
const extractFrames = (options) => {
    return (0, internal_extract_frames_1.internalExtractFrames)({
        ...options,
        signal: options.signal ?? null,
        acknowledgeRemotionLicense: options.acknowledgeRemotionLicense ?? false,
        logLevel: options.logLevel ?? 'info',
        parseMediaImplementation: media_parser_1.parseMedia,
    });
};
exports.extractFrames = extractFrames;
