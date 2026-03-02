"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFramesOnWebWorker = void 0;
const worker_1 = require("@remotion/media-parser/worker");
const internal_extract_frames_1 = require("./internal-extract-frames");
const extractFramesOnWebWorker = (options) => {
    return (0, internal_extract_frames_1.internalExtractFrames)({
        ...options,
        signal: options.signal ?? null,
        acknowledgeRemotionLicense: options.acknowledgeRemotionLicense ?? false,
        logLevel: options.logLevel ?? 'info',
        parseMediaImplementation: worker_1.parseMediaOnWebWorker,
    });
};
exports.extractFramesOnWebWorker = extractFramesOnWebWorker;
