"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanReadableLogLevel = void 0;
const humanReadableLogLevel = (logLevel) => {
    if (logLevel === 'trace') {
        return 'Trace';
    }
    if (logLevel === 'verbose') {
        return 'Verbose';
    }
    if (logLevel === 'info') {
        return 'Info';
    }
    if (logLevel === 'warn') {
        return 'Warn';
    }
    if (logLevel === 'error') {
        return 'Error';
    }
    throw new TypeError(`Got unexpected log level "${logLevel}"`);
};
exports.humanReadableLogLevel = humanReadableLogLevel;
