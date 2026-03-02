"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.secondverboseTag = exports.verboseTag = exports.INDENT_TOKEN = void 0;
/* eslint-disable no-console */
const chalk_1 = require("./chalk");
const is_color_supported_1 = require("./chalk/is-color-supported");
const log_level_1 = require("./log-level");
const repro_1 = require("./repro");
const truthy_1 = require("./truthy");
exports.INDENT_TOKEN = chalk_1.chalk.gray('│');
const verboseTag = (str) => {
    return (0, is_color_supported_1.isColorSupported)() ? chalk_1.chalk.bgBlack(` ${str} `) : `[${str}]`;
};
exports.verboseTag = verboseTag;
const secondverboseTag = (str) => {
    return (0, is_color_supported_1.isColorSupported)() ? chalk_1.chalk.bgWhite(` ${str} `) : `[${str}]`;
};
exports.secondverboseTag = secondverboseTag;
exports.Log = {
    formatLogs: (logLevel, options, args) => {
        return [
            options.indent ? exports.INDENT_TOKEN : null,
            options.tag ? (0, exports.verboseTag)(options.tag) : null,
        ]
            .filter(truthy_1.truthy)
            .concat(args.map((a) => {
            if (logLevel === 'warn') {
                return chalk_1.chalk.yellow(a);
            }
            if (logLevel === 'error') {
                return chalk_1.chalk.red(a);
            }
            if (logLevel === 'verbose' || logLevel === 'trace') {
                return chalk_1.chalk.gray(a);
            }
            return a;
        }));
    },
    trace: (options, ...args) => {
        (0, repro_1.writeInRepro)('trace', ...args);
        if ((0, log_level_1.isEqualOrBelowLogLevel)(options.logLevel, 'trace')) {
            if (args.length === 0) {
                // Lambda will print "undefined" otherwise
                return process.stdout.write('\n');
            }
            return console.log(...exports.Log.formatLogs('trace', options, args));
        }
    },
    verbose: (options, ...args) => {
        (0, repro_1.writeInRepro)('verbose', ...args);
        if ((0, log_level_1.isEqualOrBelowLogLevel)(options.logLevel, 'verbose')) {
            if (args.length === 0) {
                // Lambda will print "undefined" otherwise
                return process.stdout.write('\n');
            }
            return console.log(...exports.Log.formatLogs('verbose', options, args));
        }
    },
    info: (options, ...args) => {
        (0, repro_1.writeInRepro)('info', ...args);
        if ((0, log_level_1.isEqualOrBelowLogLevel)(options.logLevel, 'info')) {
            if (args.length === 0) {
                // Lambda will print "undefined" otherwise
                return process.stdout.write('\n');
            }
            return console.log(...exports.Log.formatLogs('info', options, args));
        }
    },
    warn: (options, ...args) => {
        (0, repro_1.writeInRepro)('warn', ...args);
        if ((0, log_level_1.isEqualOrBelowLogLevel)(options.logLevel, 'warn')) {
            if (args.length === 0) {
                // Lambda will print "undefined" otherwise
                return process.stdout.write('\n');
            }
            return console.warn(...exports.Log.formatLogs('warn', options, args));
        }
    },
    error: (options, ...args) => {
        (0, repro_1.writeInRepro)('error', ...args);
        if ((0, log_level_1.isEqualOrBelowLogLevel)(options.logLevel, 'error')) {
            if (args.length === 0) {
                // Lambda will print "undefined" otherwise
                return process.stdout.write('\n');
            }
            return console.error(...exports.Log.formatLogs('error', options, args));
        }
    },
};
