"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.isEqualOrBelowLogLevel = exports.logLevels = void 0;
/* eslint-disable no-console */
exports.logLevels = ['trace', 'verbose', 'info', 'warn', 'error'];
const getNumberForLogLevel = (level) => {
    return exports.logLevels.indexOf(level);
};
const isEqualOrBelowLogLevel = (currentLevel, level) => {
    return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};
exports.isEqualOrBelowLogLevel = isEqualOrBelowLogLevel;
exports.Log = {
    trace: (logLevel, ...args) => {
        if ((0, exports.isEqualOrBelowLogLevel)(logLevel, 'trace')) {
            return console.log(...args);
        }
    },
    verbose: (logLevel, ...args) => {
        if ((0, exports.isEqualOrBelowLogLevel)(logLevel, 'verbose')) {
            return console.log(...args);
        }
    },
    info: (logLevel, ...args) => {
        if ((0, exports.isEqualOrBelowLogLevel)(logLevel, 'info')) {
            return console.log(...args);
        }
    },
    warn: (logLevel, ...args) => {
        if ((0, exports.isEqualOrBelowLogLevel)(logLevel, 'warn')) {
            return console.warn(...args);
        }
    },
    error: (...args) => {
        return console.error(...args);
    },
};
