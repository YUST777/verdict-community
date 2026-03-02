"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeError = exports.serializeError = void 0;
const errors_1 = require("../errors");
const log_1 = require("../log");
const serializeError = ({ error, logLevel, seekingHints, }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (error instanceof errors_1.IsAnImageError) {
        return {
            type: 'response-error',
            errorName: 'IsAnImageError',
            dimensions: error.dimensions,
            errorMessage: error.message,
            errorStack: (_a = error.stack) !== null && _a !== void 0 ? _a : '',
            fileName: error.fileName,
            imageType: error.imageType,
            mimeType: error.mimeType,
            sizeInBytes: error.sizeInBytes,
        };
    }
    if (error instanceof errors_1.IsAPdfError) {
        return {
            type: 'response-error',
            errorName: 'IsAPdfError',
            errorMessage: error.message,
            errorStack: (_b = error.stack) !== null && _b !== void 0 ? _b : '',
            mimeType: error.mimeType,
            sizeInBytes: error.sizeInBytes,
            fileName: error.fileName,
        };
    }
    if (error instanceof errors_1.MediaParserAbortError) {
        return {
            type: 'response-error',
            errorName: 'MediaParserAbortError',
            errorMessage: error.message,
            errorStack: (_c = error.stack) !== null && _c !== void 0 ? _c : '',
            seekingHints,
        };
    }
    if (error instanceof TypeError) {
        return {
            type: 'response-error',
            errorName: 'TypeError',
            errorMessage: error.message,
            errorStack: (_d = error.stack) !== null && _d !== void 0 ? _d : '',
        };
    }
    if (error.name === 'AbortError') {
        return {
            type: 'response-error',
            errorName: 'AbortError',
            errorMessage: error.message,
            errorStack: (_e = error.stack) !== null && _e !== void 0 ? _e : '',
        };
    }
    if (error.name === 'NotReadableError') {
        return {
            type: 'response-error',
            errorName: 'NotReadableError',
            errorMessage: error.message,
            errorStack: (_f = error.stack) !== null && _f !== void 0 ? _f : '',
        };
    }
    if (error.name !== 'Error') {
        log_1.Log.warn(logLevel, `Original error was of type ${error.name} did not properly propagate`);
    }
    return {
        type: 'response-error',
        errorName: 'Error',
        errorMessage: error.message,
        errorStack: (_g = error.stack) !== null && _g !== void 0 ? _g : '',
    };
};
exports.serializeError = serializeError;
const deserializeError = (error) => {
    switch (error.errorName) {
        case 'IsAnImageError':
            return new errors_1.IsAnImageError({
                dimensions: error.dimensions,
                fileName: error.fileName,
                imageType: error.imageType,
                mimeType: error.mimeType,
                sizeInBytes: error.sizeInBytes,
                message: error.errorMessage,
            });
        case 'IsAPdfError':
            return new errors_1.IsAPdfError({
                fileName: error.fileName,
                mimeType: error.mimeType,
                sizeInBytes: error.sizeInBytes,
                message: error.errorMessage,
            });
        case 'IsAnUnsupportedFileTypeError':
            return new errors_1.IsAnUnsupportedFileTypeError({
                fileName: error.fileName,
                mimeType: error.mimeType,
                sizeInBytes: error.sizeInBytes,
                message: error.errorMessage,
            });
        case 'MediaParserAbortError':
            return new errors_1.MediaParserAbortError(error.errorMessage);
        case 'Error':
            return new Error(error.errorMessage);
        case 'AbortError':
            return new Error(error.errorMessage);
        // TODO: Document 2GB limit
        case 'NotReadableError':
            return new Error(error.errorMessage);
        case 'TypeError':
            return new TypeError(error.errorMessage);
        default:
            throw new Error(`Unknown error name: ${error}`);
    }
};
exports.deserializeError = deserializeError;
