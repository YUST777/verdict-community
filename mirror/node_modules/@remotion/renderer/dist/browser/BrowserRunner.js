"use strict";
/**
 * Copyright 2020 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBrowserRunner = void 0;
const childProcess = __importStar(require("node:child_process"));
const node_path_1 = require("node:path");
const delete_directory_1 = require("../delete-directory");
const log_level_1 = require("../log-level");
const logger_1 = require("../logger");
const truthy_1 = require("../truthy");
const assert_1 = require("./assert");
const Connection_1 = require("./Connection");
const Errors_1 = require("./Errors");
const NodeWebSocketTransport_1 = require("./NodeWebSocketTransport");
const should_log_message_1 = require("./should-log-message");
const util_1 = require("./util");
const PROCESS_ERROR_EXPLANATION = `Puppeteer was unable to kill the process which ran the browser binary.
 This means that, on future Puppeteer launches, Puppeteer might not be able to launch the browser.
 Please check your open processes and ensure that the browser processes that Puppeteer launched have been killed.
 If you think this is a bug, please report it on the Puppeteer issue tracker.`;
const makeBrowserRunner = async ({ executablePath, processArguments, userDataDir, logLevel, indent, timeout, }) => {
    var _a, _b;
    const dumpio = (0, log_level_1.isEqualOrBelowLogLevel)(logLevel, 'verbose');
    const stdio = dumpio
        ? ['ignore', 'pipe', 'pipe']
        : ['pipe', 'pipe', 'pipe'];
    const proc = childProcess.spawn(executablePath, processArguments, {
        // On non-windows platforms, `detached: true` makes child process a
        // leader of a new process group, making it possible to kill child
        // process tree with `.kill(-pid)` command. @see
        // https://nodejs.org/api/child_process.html#child_process_options_detached
        detached: process.platform !== 'win32',
        env: process.env,
        stdio,
    });
    const browserWSEndpoint = await waitForWSEndpoint({
        browserProcess: proc,
        timeout,
        indent,
        logLevel,
    });
    const transport = await NodeWebSocketTransport_1.NodeWebSocketTransport.create(browserWSEndpoint);
    const connection = new Connection_1.Connection(transport);
    const killProcess = () => {
        // If the process failed to launch (for example if the browser executable path
        // is invalid), then the process does not get a pid assigned. A call to
        // `proc.kill` would error, as the `pid` to-be-killed can not be found.
        if (proc.pid && pidExists(proc.pid)) {
            try {
                if (process.platform === 'win32') {
                    childProcess.exec(`taskkill /pid ${proc.pid} /T /F`, (error) => {
                        if (error) {
                            // taskkill can fail to kill the process e.g. due to missing permissions.
                            // Let's kill the process via Node API. This delays killing of all child
                            // processes of `this.proc` until the main Node.js process dies.
                            proc.kill();
                        }
                    });
                }
                else {
                    // on linux the process group can be killed with the group id prefixed with
                    // a minus sign. The process group id is the group leader's pid.
                    const processGroupId = -proc.pid;
                    logger_1.Log.verbose({ indent, logLevel }, `Trying to kill browser process group ${processGroupId}`);
                    try {
                        process.kill(processGroupId, 'SIGKILL');
                    }
                    catch (error) {
                        // Killing the process group can fail due e.g. to missing permissions.
                        // Let's kill the process via Node API. This delays killing of all child
                        // processes of `this.proc` until the main Node.js process dies.
                        logger_1.Log.verbose({ indent, logLevel }, `Could not kill browser process group ${processGroupId}. Killing process via Node.js API`);
                        proc.kill('SIGKILL');
                    }
                }
            }
            catch (error) {
                throw new Error(`${PROCESS_ERROR_EXPLANATION}\nError cause: ${(0, util_1.isErrorLike)(error) ? error.stack : error}`);
            }
        }
        (0, delete_directory_1.deleteDirectory)(userDataDir);
        // Cleanup this listener last, as that makes sure the full callback runs. If we
        // perform this earlier, then the previous function calls would not happen.
        (0, util_1.removeEventListeners)(listeners);
    };
    const closeProcess = () => {
        if (closed) {
            return Promise.resolve();
        }
        logger_1.Log.verbose({ indent, logLevel }, 'Received SIGTERM signal. Killing browser process');
        killProcess();
        (0, delete_directory_1.deleteDirectory)(userDataDir);
        // Cleanup this listener last, as that makes sure the full callback runs. If we
        // perform this earlier, then the previous function calls would not happen.
        (0, util_1.removeEventListeners)(listeners);
        return processClosing;
    };
    if (dumpio) {
        (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (d) => {
            const message = d.toString('utf8').trim();
            if ((0, should_log_message_1.shouldLogBrowserMessage)(message)) {
                const formatted = (0, should_log_message_1.formatChromeMessage)(message);
                if (!formatted) {
                    return;
                }
                const { output, tag } = formatted;
                logger_1.Log.verbose({ indent, logLevel, tag }, output);
            }
        });
        (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (d) => {
            const message = d.toString('utf8').trim();
            if ((0, should_log_message_1.shouldLogBrowserMessage)(message)) {
                const formatted = (0, should_log_message_1.formatChromeMessage)(message);
                if (!formatted) {
                    return;
                }
                const { output, tag } = formatted;
                logger_1.Log.error({ indent, logLevel, tag }, output);
            }
        });
    }
    let closed = false;
    const processClosing = new Promise((fulfill, reject) => {
        proc.once('exit', () => {
            closed = true;
            // Cleanup as processes exit.
            try {
                fulfill();
            }
            catch (error) {
                reject(error);
            }
        });
    });
    const listeners = [(0, util_1.addEventListener)(process, 'exit', killProcess)];
    listeners.push((0, util_1.addEventListener)(process, 'SIGINT', () => {
        killProcess();
        process.exit(130);
    }));
    listeners.push((0, util_1.addEventListener)(process, 'SIGTERM', closeProcess));
    listeners.push((0, util_1.addEventListener)(process, 'SIGHUP', closeProcess));
    const deleteBrowserCaches = () => {
        // We leave some data:
        // Default/Cookies
        // Default/Local Storage
        // Default/Session Storage
        // DevToolsActivePort
        // Because not sure if it is bad to delete them while Chrome is running.
        const cachePaths = [
            (0, node_path_1.join)(userDataDir, 'Default', 'Cache', 'Cache_Data'),
            (0, node_path_1.join)(userDataDir, 'Default', 'Code Cache'),
            (0, node_path_1.join)(userDataDir, 'Default', 'DawnCache'),
            (0, node_path_1.join)(userDataDir, 'Default', 'GPUCache'),
        ];
        for (const p of cachePaths) {
            (0, delete_directory_1.deleteDirectory)(p);
        }
    };
    const rememberEventLoop = () => {
        var _a, _b;
        proc.ref();
        // @ts-expect-error
        (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.ref();
        // @ts-expect-error
        (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.ref();
        (0, assert_1.assert)(connection, 'BrowserRunner not connected.');
        connection.transport.rememberEventLoop();
    };
    const forgetEventLoop = () => {
        var _a, _b;
        proc.unref();
        // @ts-expect-error
        (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.unref();
        // @ts-expect-error
        (_b = proc.stderr) === null || _b === void 0 ? void 0 : _b.unref();
        (0, assert_1.assert)(connection, 'BrowserRunner not connected.');
        connection.transport.forgetEventLoop();
    };
    return {
        listeners,
        deleteBrowserCaches,
        forgetEventLoop,
        rememberEventLoop,
        connection,
        closeProcess,
    };
};
exports.makeBrowserRunner = makeBrowserRunner;
function waitForWSEndpoint({ browserProcess, timeout, logLevel, indent, }) {
    const browserStderr = browserProcess.stderr;
    const browserStdout = browserProcess.stdout;
    (0, assert_1.assert)(browserStderr, '`browserProcess` does not have stderr.');
    (0, assert_1.assert)(browserStdout, '`browserProcess` does not have stdout.');
    let stdioString = '';
    return new Promise((resolve, reject) => {
        browserStderr.addListener('data', onStdIoData);
        browserStdout.addListener('data', onStdIoData);
        browserStderr.addListener('close', onClose);
        const listeners = [
            () => browserStderr.removeListener('data', onStdIoData),
            () => browserStdout.removeListener('data', onStdIoData),
            () => browserStderr.removeListener('close', onClose),
            (0, util_1.addEventListener)(browserProcess, 'exit', (code, signal) => {
                logger_1.Log.verbose({ indent, logLevel }, 'Browser process exited with code', code, 'signal', signal);
                return onClose(new Error(`Closed with ${code} signal: ${signal}`));
            }),
            (0, util_1.addEventListener)(browserProcess, 'error', (error) => {
                return onClose(error);
            }),
        ];
        const timeoutId = timeout ? setTimeout(onTimeout, timeout) : 0;
        function onClose(error) {
            cleanup();
            reject(new Error([
                'Failed to launch the browser process!',
                error ? error.stack : null,
                stdioString,
                'Troubleshooting: https://remotion.dev/docs/troubleshooting/browser-launch',
            ]
                .filter(truthy_1.truthy)
                .join('\n')));
        }
        function onTimeout() {
            cleanup();
            reject(new Errors_1.TimeoutError(`Timed out after ${timeout} ms while trying to connect to the browser! Chrome logged the following: ${stdioString}`));
        }
        function onStdIoData(data) {
            stdioString += data.toString('utf8');
            const match = stdioString.match(/DevTools listening on (ws:\/\/.*)/);
            if (!match) {
                return;
            }
            cleanup();
            resolve(match[1]);
        }
        function cleanup() {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            (0, util_1.removeEventListeners)(listeners);
        }
    });
}
function pidExists(pid) {
    try {
        return process.kill(pid, 0);
    }
    catch (error) {
        if ((0, util_1.isErrnoException)(error)) {
            if (error.code && error.code === 'ESRCH') {
                return false;
            }
        }
        throw error;
    }
}
