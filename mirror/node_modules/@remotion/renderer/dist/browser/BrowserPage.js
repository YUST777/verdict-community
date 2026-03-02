"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
/**
 * Copyright 2017 Google Inc. All rights reserved.
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
const no_react_1 = require("remotion/no-react");
const format_logs_1 = require("../format-logs");
const logger_1 = require("../logger");
const truthy_1 = require("../truthy");
const assert_1 = require("./assert");
const ConsoleMessage_1 = require("./ConsoleMessage");
const EventEmitter_1 = require("./EventEmitter");
const FrameManager_1 = require("./FrameManager");
const JSHandle_1 = require("./JSHandle");
const TaskQueue_1 = require("./TaskQueue");
const TimeoutSettings_1 = require("./TimeoutSettings");
const util_1 = require("./util");
const shouldHideWarning = (log) => {
    // Mixed Content warnings caused by localhost should not be displayed
    if (log.text.includes('Mixed Content:') &&
        log.text.includes('http://localhost:')) {
        return true;
    }
    return false;
};
const format = (eventType, args) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const previewString = args
        .filter((a) => {
        var _a;
        return !(a.type === 'symbol' && ((_a = a.description) === null || _a === void 0 ? void 0 : _a.includes(`__remotion_`)));
    })
        .map((a) => (0, format_logs_1.formatRemoteObject)(a))
        .filter(Boolean)
        .join(' ');
    let logLevelFromRemotionLog = null;
    let tag = null;
    for (const a of args) {
        if (a.type === 'symbol' && ((_a = a.description) === null || _a === void 0 ? void 0 : _a.includes(`__remotion_level_`))) {
            logLevelFromRemotionLog = (_d = (_c = (_b = a.description) === null || _b === void 0 ? void 0 : _b.split('__remotion_level_')) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d.replace(')', '');
        }
        if (a.type === 'symbol' && ((_e = a.description) === null || _e === void 0 ? void 0 : _e.includes(`__remotion_tag_`))) {
            tag = (_h = (_g = (_f = a.description) === null || _f === void 0 ? void 0 : _f.split('__remotion_tag_')) === null || _g === void 0 ? void 0 : _g[1]) === null || _h === void 0 ? void 0 : _h.replace(')', '');
        }
    }
    const logLevelFromEvent = eventType === 'debug'
        ? 'verbose'
        : eventType === 'error'
            ? 'error'
            : eventType === 'warning'
                ? 'warn'
                : 'verbose';
    return { previewString, logLevelFromRemotionLog, logLevelFromEvent, tag };
};
class Page extends EventEmitter_1.EventEmitter {
    id;
    static async _create({ client, target, defaultViewport, browser, sourceMapGetter, logLevel, indent, pageIndex, onBrowserLog, onLog, }) {
        const page = new Page({
            client,
            target,
            browser,
            sourceMapGetter,
            logLevel,
            indent,
            pageIndex,
            onBrowserLog,
            onLog,
        });
        await page.#initialize();
        await page.setViewport(defaultViewport);
        return page;
    }
    closed = false;
    #client;
    #target;
    #timeoutSettings = new TimeoutSettings_1.TimeoutSettings();
    #frameManager;
    #pageBindings = new Map();
    browser;
    screenshotTaskQueue;
    sourceMapGetter;
    logLevel;
    indent;
    pageIndex;
    onBrowserLog;
    onLog;
    constructor({ client, target, browser, sourceMapGetter, logLevel, indent, pageIndex, onBrowserLog, onLog, }) {
        super();
        this.#client = client;
        this.#target = target;
        this.#frameManager = new FrameManager_1.FrameManager(client, this, indent, logLevel);
        this.screenshotTaskQueue = new TaskQueue_1.TaskQueue();
        this.browser = browser;
        this.id = String(Math.random());
        this.sourceMapGetter = sourceMapGetter;
        this.logLevel = logLevel;
        this.indent = indent;
        this.pageIndex = pageIndex;
        this.onBrowserLog = onBrowserLog;
        this.onLog = onLog;
        client.on('Target.attachedToTarget', (event) => {
            switch (event.targetInfo.type) {
                case 'iframe':
                    break;
                case 'worker':
                    break;
                default:
                    // If we don't detach from service workers, they will never die.
                    // We still want to attach to workers for emitting events.
                    // We still want to attach to iframes so sessions may interact with them.
                    // We detach from all other types out of an abundance of caution.
                    // See https://source.chromium.org/chromium/chromium/src/+/main:content/browser/devtools/devtools_agent_host_impl.cc?ss=chromium&q=f:devtools%20-f:out%20%22::kTypePage%5B%5D%22
                    // for the complete list of available types.
                    client
                        .send('Target.detachFromTarget', {
                        sessionId: event.sessionId,
                    })
                        .catch((err) => logger_1.Log.error({ indent, logLevel }, err));
            }
        });
        client.on('Runtime.consoleAPICalled', (event) => {
            return this.#onConsoleAPI(event);
        });
        client.on('Runtime.bindingCalled', (event) => {
            return this.#onBindingCalled(event);
        });
        client.on('Inspector.targetCrashed', () => {
            return this.#onTargetCrashed();
        });
        client.on('Log.entryAdded', (event) => {
            return this.#onLogEntryAdded(event);
        });
    }
    #onConsole = (log) => {
        var _a, _b;
        var _c;
        const stackTrace = log.stackTrace();
        const { url, columnNumber, lineNumber } = (_c = stackTrace[0]) !== null && _c !== void 0 ? _c : {};
        const logLevel = this.logLevel;
        const indent = this.indent;
        if (shouldHideWarning(log)) {
            return;
        }
        (_a = this.onBrowserLog) === null || _a === void 0 ? void 0 : _a.call(this, {
            stackTrace,
            text: log.text,
            type: log.type,
        });
        if ((url === null || url === void 0 ? void 0 : url.endsWith(no_react_1.NoReactInternals.bundleName)) &&
            lineNumber &&
            this.sourceMapGetter()) {
            const origPosition = (_b = this.sourceMapGetter()) === null || _b === void 0 ? void 0 : _b.originalPositionFor({
                column: columnNumber !== null && columnNumber !== void 0 ? columnNumber : 0,
                line: lineNumber,
            });
            const file = [
                origPosition === null || origPosition === void 0 ? void 0 : origPosition.source,
                origPosition === null || origPosition === void 0 ? void 0 : origPosition.line,
                origPosition === null || origPosition === void 0 ? void 0 : origPosition.column,
            ]
                .filter(truthy_1.truthy)
                .join(':');
            const isDelayRenderClear = log.previewString.includes(no_react_1.NoReactInternals.DELAY_RENDER_CLEAR_TOKEN);
            const tabInfo = `Tab ${this.pageIndex}`;
            const tagInfo = [origPosition === null || origPosition === void 0 ? void 0 : origPosition.name, isDelayRenderClear ? null : file]
                .filter(truthy_1.truthy)
                .join('@');
            const tag = [tabInfo, log.tag, log.tag ? null : tagInfo]
                .filter(truthy_1.truthy)
                .join(', ');
            this.onLog({
                logLevel: log.logLevel,
                tag,
                previewString: log.previewString,
            });
        }
        else if (log.type === 'error') {
            if (log.text.includes('Failed to load resource:')) {
                logger_1.Log.error({ logLevel, tag: url, indent }, 
                // Sometimes the log is like this:
                // Failed to load resource: the server responded with a status of 404 ()
                // We remove the empty parentheses.
                log.text.replace(/\(\)$/, ''));
            }
            else {
                logger_1.Log.error({ logLevel, tag: `console.${log.type}`, indent }, log.text);
            }
        }
        else {
            logger_1.Log.verbose({ logLevel, tag: `console.${log.type}`, indent }, log.text);
        }
    };
    async #initialize() {
        await Promise.all([
            this.#frameManager.initialize(),
            this.#client.send('Target.setAutoAttach', {
                autoAttach: true,
                waitForDebuggerOnStart: false,
                flatten: true,
            }),
            this.#client.send('Performance.enable'),
            this.#client.send('Log.enable'),
        ]);
    }
    /**
     * Listen to page events.
     */
    // Note: this method exists to define event typings and handle
    // proper wireup of cooperative request interception. Actual event listening and
    // dispatching is delegated to EventEmitter.
    on(eventName, handler) {
        return super.on(eventName, handler);
    }
    once(eventName, handler) {
        // Note: this method only exists to define the types; we delegate the impl
        // to EventEmitter.
        return super.once(eventName, handler);
    }
    off(eventName, handler) {
        return super.off(eventName, handler);
    }
    /**
     * @returns A target this page was created from.
     */
    target() {
        return this.#target;
    }
    _client() {
        return this.#client;
    }
    #onTargetCrashed() {
        // This error message is being checked against in is-flaky-error.ts
        this.emit('error', new Error('Page crashed!'));
    }
    #onLogEntryAdded(event) {
        var _a;
        const { level, text, args, source, url, lineNumber } = event.entry;
        if (args) {
            args.map((arg) => {
                return (0, util_1.releaseObject)(this.#client, arg);
            });
        }
        const { previewString, logLevelFromRemotionLog, logLevelFromEvent, tag } = format(level, args !== null && args !== void 0 ? args : []);
        if (source !== 'worker') {
            const message = new ConsoleMessage_1.ConsoleMessage({
                type: level,
                text,
                args: [],
                stackTraceLocations: [{ url, lineNumber }],
                previewString,
                logLevel: logLevelFromRemotionLog !== null && logLevelFromRemotionLog !== void 0 ? logLevelFromRemotionLog : logLevelFromEvent,
                tag,
            });
            (_a = this.onBrowserLog) === null || _a === void 0 ? void 0 : _a.call(this, {
                stackTrace: message.stackTrace(),
                text: message.text,
                type: message.type,
            });
            this.#onConsole(message);
        }
    }
    /**
     * @returns The page's main frame.
     * @remarks
     * Page is guaranteed to have a main frame which persists during navigations.
     */
    mainFrame() {
        return this.#frameManager.mainFrame();
    }
    async setViewport(viewport) {
        const fromSurface = !process.env.DISABLE_FROM_SURFACE;
        const request = fromSurface
            ? {
                mobile: false,
                width: viewport.width,
                height: viewport.height,
                deviceScaleFactor: viewport.deviceScaleFactor,
                screenOrientation: {
                    angle: 0,
                    type: 'portraitPrimary',
                },
            }
            : {
                mobile: false,
                width: viewport.width,
                height: viewport.height,
                deviceScaleFactor: 1,
                screenHeight: viewport.height,
                screenWidth: viewport.width,
                scale: viewport.deviceScaleFactor,
                viewport: {
                    height: viewport.height * viewport.deviceScaleFactor,
                    width: viewport.width * viewport.deviceScaleFactor,
                    scale: 1,
                    x: 0,
                    y: 0,
                },
            };
        const { value } = await this.#client.send('Emulation.setDeviceMetricsOverride', request);
        return value;
    }
    setDefaultNavigationTimeout(timeout) {
        this.#timeoutSettings.setDefaultNavigationTimeout(timeout);
    }
    setDefaultTimeout(timeout) {
        this.#timeoutSettings.setDefaultTimeout(timeout);
    }
    async evaluateHandle(pageFunction, ...args) {
        const context = await this.mainFrame().executionContext();
        return context.evaluateHandle(pageFunction, ...args);
    }
    #onConsoleAPI(event) {
        if (event.executionContextId === 0) {
            return;
        }
        const context = this.#frameManager.executionContextById(event.executionContextId, this.#client);
        const values = event.args.map((arg) => {
            return (0, JSHandle_1._createJSHandle)(context, arg);
        });
        this.#addConsoleMessage(event.type, values, event.stackTrace);
    }
    async #onBindingCalled(event) {
        let payload;
        try {
            payload = JSON.parse(event.payload);
        }
        catch (_a) {
            // The binding was either called by something in the page or it was
            // called before our wrapper was initialized.
            return;
        }
        const { type, name, seq, args } = payload;
        if (type !== 'exposedFun' || !this.#pageBindings.has(name)) {
            return;
        }
        let expression = null;
        try {
            const pageBinding = this.#pageBindings.get(name);
            (0, assert_1.assert)(pageBinding);
            const result = await pageBinding(...args);
            expression = (0, util_1.pageBindingDeliverResultString)(name, seq, result);
        }
        catch (_error) {
            if ((0, util_1.isErrorLike)(_error)) {
                expression = (0, util_1.pageBindingDeliverErrorString)(name, seq, _error.message, _error.stack);
            }
            else {
                expression = (0, util_1.pageBindingDeliverErrorValueString)(name, seq, _error);
            }
        }
        await this.#client.send('Runtime.evaluate', {
            expression,
            contextId: event.executionContextId,
        });
    }
    #addConsoleMessage(eventType, args, stackTrace) {
        var _a, _b;
        const textTokens = [];
        for (const arg of args) {
            const remoteObject = arg._remoteObject;
            if (remoteObject.objectId) {
                textTokens.push(arg.toString());
            }
            else {
                textTokens.push((0, util_1.valueFromRemoteObject)(remoteObject));
            }
        }
        const stackTraceLocations = [];
        if (stackTrace) {
            for (const callFrame of stackTrace.callFrames) {
                stackTraceLocations.push({
                    url: callFrame.url,
                    lineNumber: callFrame.lineNumber,
                    columnNumber: callFrame.columnNumber,
                });
            }
        }
        const { previewString, logLevelFromRemotionLog, logLevelFromEvent, tag } = format(eventType, (_a = args.map((a) => a._remoteObject)) !== null && _a !== void 0 ? _a : []);
        const logLevel = (_b = logLevelFromRemotionLog) !== null && _b !== void 0 ? _b : logLevelFromEvent;
        const message = new ConsoleMessage_1.ConsoleMessage({
            type: eventType,
            text: textTokens.join(' '),
            args,
            stackTraceLocations,
            previewString,
            logLevel,
            tag,
        });
        this.#onConsole(message);
    }
    url() {
        return this.mainFrame().url();
    }
    goto({ url, timeout, options = {}, }) {
        return this.#frameManager.mainFrame().goto(url, timeout, options);
    }
    async bringToFront() {
        await this.#client.send('Page.bringToFront');
    }
    async setAutoDarkModeOverride() {
        const result = await this.#client.send('Emulation.setEmulatedMedia', {
            media: 'screen',
            features: [
                {
                    name: 'prefers-color-scheme',
                    value: 'dark',
                },
            ],
        });
        console.log(result);
    }
    evaluate(pageFunction, ...args) {
        return this.#frameManager.mainFrame().evaluate(pageFunction, ...args);
    }
    async evaluateOnNewDocument(pageFunction, ...args) {
        const source = (0, util_1.evaluationString)(pageFunction, ...args);
        await this.#client.send('Page.addScriptToEvaluateOnNewDocument', {
            source,
        });
    }
    async close(options = { runBeforeUnload: undefined }) {
        const connection = this.#client.connection();
        if (!connection) {
            return;
        }
        const runBeforeUnload = Boolean(options.runBeforeUnload);
        if (runBeforeUnload) {
            await this.#client.send('Page.close');
        }
        else {
            await connection.send('Target.closeTarget', {
                targetId: this.#target._targetId,
            });
            await this.#target._isClosedPromise;
        }
    }
    setBrowserSourceMapGetter(context) {
        this.sourceMapGetter = context;
    }
}
exports.Page = Page;
