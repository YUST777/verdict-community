"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCompositor = exports.startLongRunningCompositor = void 0;
const node_child_process_1 = require("node:child_process");
const node_path_1 = __importDefault(require("node:path"));
const streaming_1 = require("@remotion/streaming");
const log_level_1 = require("../log-level");
const logger_1 = require("../logger");
const get_executable_path_1 = require("./get-executable-path");
const make_file_executable_1 = require("./make-file-executable");
const make_nonce_1 = require("./make-nonce");
const serialize_command_1 = require("./serialize-command");
const startLongRunningCompositor = ({ maximumFrameCacheItemsInBytes, logLevel, indent, binariesDirectory, extraThreads, }) => {
    return (0, exports.startCompositor)({
        type: 'StartLongRunningProcess',
        payload: {
            concurrency: extraThreads,
            maximum_frame_cache_size_in_bytes: maximumFrameCacheItemsInBytes,
            verbose: (0, log_level_1.isEqualOrBelowLogLevel)(logLevel, 'verbose'),
        },
        logLevel,
        indent,
        binariesDirectory,
    });
};
exports.startLongRunningCompositor = startLongRunningCompositor;
const startCompositor = ({ type, payload, logLevel, indent, binariesDirectory = null, }) => {
    var _a;
    const bin = (0, get_executable_path_1.getExecutablePath)({
        type: 'compositor',
        indent,
        logLevel,
        binariesDirectory,
    });
    (0, make_file_executable_1.makeFileExecutableIfItIsNot)(bin);
    const fullCommand = (0, serialize_command_1.serializeCommand)(type, payload);
    const cwd = node_path_1.default.dirname(bin);
    const child = (0, node_child_process_1.spawn)(bin, [JSON.stringify(fullCommand)], {
        cwd,
        env: process.platform === 'darwin'
            ? {
                // Should work out of the box, but sometimes it doesn't
                // https://github.com/remotion-dev/remotion/issues/3862
                DYLD_LIBRARY_PATH: cwd,
            }
            : undefined,
    });
    let stderrChunks = [];
    const waiters = new Map();
    const onMessage = (statusType, nonce, data) => {
        // Nonce '0' just means that the message should be logged
        if (nonce === '0') {
            logger_1.Log.verbose({ indent, logLevel, tag: 'compositor' }, new TextDecoder('utf8').decode(data));
        }
        else if (waiters.has(nonce)) {
            if (statusType === 'error') {
                try {
                    const parsed = JSON.parse(new TextDecoder('utf8').decode(data));
                    waiters.get(nonce).reject(new Error(`Compositor error: ${parsed.error}\n${parsed.backtrace}`));
                }
                catch (_a) {
                    waiters.get(nonce).reject(new Error(new TextDecoder('utf8').decode(data)));
                }
            }
            else {
                waiters.get(nonce).resolve(data);
            }
            waiters.delete(nonce);
        }
    };
    const { onData, getOutputBuffer, clear } = (0, streaming_1.makeStreamer)(onMessage);
    let runningStatus = { type: 'running' };
    child.stdout.on('data', onData);
    child.stderr.on('data', (data) => {
        stderrChunks.push(data);
    });
    let resolve = null;
    let reject = null;
    child.on('close', (code, signal) => {
        const waitersToKill = Array.from(waiters.values());
        if (code === 0) {
            runningStatus = { type: 'quit-without-error', signal };
            resolve === null || resolve === void 0 ? void 0 : resolve();
            for (const waiter of waitersToKill) {
                waiter.reject(new Error(`Compositor quit${signal ? ` with signal ${signal}` : ''}`));
            }
            waiters.clear();
        }
        else {
            const errorMessage = Buffer.concat(stderrChunks).toString('utf-8') +
                new TextDecoder('utf-8').decode(getOutputBuffer());
            runningStatus = { type: 'quit-with-error', error: errorMessage, signal };
            logger_1.Log.verbose({ indent, logLevel }, `Compositor exited with code ${code} and signal ${signal}`);
            const error = code === null
                ? new Error(`Compositor exited with signal ${signal}`)
                : new Error(`Compositor exited with code ${code}: ${errorMessage}`);
            for (const waiter of waitersToKill) {
                waiter.reject(error);
            }
            waiters.clear();
            reject === null || reject === void 0 ? void 0 : reject(error);
        }
        // Need to manually free up memory
        clear();
        stderrChunks = [];
    });
    const waitForDone = () => {
        return new Promise((res, rej) => {
            if (runningStatus.type === 'quit-without-error') {
                rej(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ''}`));
                return;
            }
            if (runningStatus.type === 'quit-with-error') {
                rej(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ''}: ${runningStatus.error}`));
                return;
            }
            resolve = res;
            reject = rej;
        });
    };
    const finishCommands = async () => {
        // Prevent this function from throwing an error if instead a rejected promise should be returned
        await Promise.resolve();
        if (runningStatus.type === 'quit-with-error') {
            return Promise.reject(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ''}: ${runningStatus.error}`));
        }
        if (runningStatus.type === 'quit-without-error') {
            return Promise.reject(new Error(`Compositor quit${runningStatus.signal ? ` with signal ${runningStatus.signal}` : ''}`));
        }
        return new Promise((res, rej) => {
            child.stdin.write('EOF\n', (e) => {
                if (e) {
                    rej(e);
                    return;
                }
                res();
            });
        });
    };
    const shutDownOrKill = () => {
        const shutDownCase = async () => {
            await finishCommands();
            await waitForDone();
        };
        let timeout = null;
        const killCase = async () => {
            await new Promise((res) => {
                timeout = setTimeout(res, 5000);
            });
            child.kill('SIGKILL');
        };
        return Promise.race([shutDownCase(), killCase()]).finally(() => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
        });
    };
    return {
        shutDownOrKill,
        waitForDone,
        finishCommands,
        executeCommand: (command, params) => {
            return new Promise((_resolve, _reject) => {
                if (runningStatus.type === 'quit-without-error') {
                    _reject(new Error(`Compositor quit${runningStatus.signal
                        ? ` with signal ${runningStatus.signal}`
                        : ''}`));
                    return;
                }
                if (runningStatus.type === 'quit-with-error') {
                    _reject(new Error(`Compositor quit${runningStatus.signal
                        ? ` with signal ${runningStatus.signal}`
                        : ''}: ${runningStatus.error.trim()}`));
                    return;
                }
                const nonce = (0, make_nonce_1.makeNonce)();
                const composed = {
                    nonce,
                    payload: {
                        type: command,
                        params,
                    },
                };
                child.stdin.write(JSON.stringify(composed) + '\n', (e) => {
                    if (e) {
                        _reject(e);
                    }
                });
                waiters.set(nonce, {
                    resolve: _resolve,
                    reject: _reject,
                });
            });
        },
        pid: (_a = child.pid) !== null && _a !== void 0 ? _a : null,
    };
};
exports.startCompositor = startCompositor;
