"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioUndecodableError = exports.VideoUndecodableError = void 0;
class VideoUndecodableError extends Error {
    config;
    constructor({ message, config, }) {
        super(message);
        this.name = 'VideoUndecodableError';
        this.config = config;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, VideoUndecodableError);
        }
    }
}
exports.VideoUndecodableError = VideoUndecodableError;
class AudioUndecodableError extends Error {
    config;
    constructor({ message, config, }) {
        super(message);
        this.name = 'AudioUndecodableError';
        this.config = config;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AudioUndecodableError);
        }
    }
}
exports.AudioUndecodableError = AudioUndecodableError;
