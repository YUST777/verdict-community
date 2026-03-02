"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasBeenAborted = exports.MediaParserAbortError = exports.IsAnUnsupportedFileTypeError = exports.IsAPdfError = exports.IsAnImageError = void 0;
class IsAnImageError extends Error {
    constructor({ dimensions, imageType, message, mimeType, sizeInBytes, fileName, }) {
        super(message);
        this.name = 'IsAnImageError';
        this.imageType = imageType;
        this.dimensions = dimensions;
        this.mimeType = mimeType;
        this.sizeInBytes = sizeInBytes;
        this.fileName = fileName;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IsAnImageError);
        }
    }
}
exports.IsAnImageError = IsAnImageError;
class IsAPdfError extends Error {
    constructor({ message, mimeType, sizeInBytes, fileName, }) {
        super(message);
        this.name = 'IsAPdfError';
        this.mimeType = mimeType;
        this.sizeInBytes = sizeInBytes;
        this.fileName = fileName;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IsAPdfError);
        }
    }
}
exports.IsAPdfError = IsAPdfError;
class IsAnUnsupportedFileTypeError extends Error {
    constructor({ message, mimeType, sizeInBytes, fileName, }) {
        super(message);
        this.name = 'IsAnUnsupportedFileTypeError';
        this.mimeType = mimeType;
        this.sizeInBytes = sizeInBytes;
        this.fileName = fileName;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IsAnUnsupportedFileTypeError);
        }
    }
}
exports.IsAnUnsupportedFileTypeError = IsAnUnsupportedFileTypeError;
class MediaParserAbortError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MediaParserAbortError';
        this.cause = undefined;
    }
}
exports.MediaParserAbortError = MediaParserAbortError;
const hasBeenAborted = (error) => {
    return (error instanceof MediaParserAbortError ||
        // On worker it is not the same instance, but same name
        error.name === 'MediaParserAbortError' ||
        // fetch gives BodyStreamBuffer was aborted
        error.name === 'AbortError');
};
exports.hasBeenAborted = hasBeenAborted;
