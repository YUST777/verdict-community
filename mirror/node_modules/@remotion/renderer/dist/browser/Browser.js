"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserContext = exports.HeadlessBrowser = void 0;
const assert_1 = require("./assert");
const BrowserRunner_1 = require("./BrowserRunner");
const EventEmitter_1 = require("./EventEmitter");
const Target_1 = require("./Target");
const util_1 = require("./util");
class HeadlessBrowser extends EventEmitter_1.EventEmitter {
    static async create({ defaultViewport, timeout, userDataDir, args, executablePath, logLevel, indent, }) {
        const runner = await (0, BrowserRunner_1.makeBrowserRunner)({
            executablePath,
            processArguments: args,
            userDataDir,
            indent,
            logLevel,
            timeout,
        });
        const browser = new HeadlessBrowser({
            connection: runner.connection,
            defaultViewport,
            runner,
        });
        await runner.connection.send('Target.setDiscoverTargets', { discover: true });
        return browser;
    }
    #defaultViewport;
    connection;
    #defaultContext;
    #contexts;
    #targets;
    id;
    runner;
    get _targets() {
        return this.#targets;
    }
    constructor({ connection, defaultViewport, runner, }) {
        super();
        this.#defaultViewport = defaultViewport;
        this.connection = connection;
        this.id = Math.random().toString(36).substring(2, 15);
        this.#defaultContext = new BrowserContext(this);
        this.#contexts = new Map();
        this.#targets = new Map();
        this.connection.on('Target.targetCreated', this.#targetCreated.bind(this));
        this.connection.on('Target.targetDestroyed', this.#targetDestroyed.bind(this));
        this.connection.on('Target.targetInfoChanged', this.#targetInfoChanged.bind(this));
        this.runner = runner;
    }
    browserContexts() {
        return [this.#defaultContext, ...Array.from(this.#contexts.values())];
    }
    async #targetCreated(event) {
        var _a;
        const { targetInfo } = event;
        const { browserContextId } = targetInfo;
        const context = browserContextId && this.#contexts.has(browserContextId)
            ? this.#contexts.get(browserContextId)
            : this.#defaultContext;
        if (!context) {
            throw new Error('Missing browser context');
        }
        const target = new Target_1.Target(targetInfo, context, () => {
            return this.connection.createSession(targetInfo);
        }, (_a = this.#defaultViewport) !== null && _a !== void 0 ? _a : null);
        (0, assert_1.assert)(!this.#targets.has(event.targetInfo.targetId), 'Target should not exist before targetCreated');
        this.#targets.set(event.targetInfo.targetId, target);
        if (await target._initializedPromise) {
            this.emit("targetcreated" /* BrowserEmittedEvents.TargetCreated */, target);
        }
    }
    #targetDestroyed(event) {
        const target = this.#targets.get(event.targetId);
        if (!target) {
            throw new Error(`Missing target in _targetDestroyed (id = ${event.targetId})`);
        }
        target._initializedCallback(false);
        this.#targets.delete(event.targetId);
        target._closedCallback();
    }
    #targetInfoChanged(event) {
        const target = this.#targets.get(event.targetInfo.targetId);
        if (!target) {
            throw new Error(`Missing target in targetInfoChanged (id = ${event.targetInfo.targetId})`);
        }
        const previousURL = target.url();
        const wasInitialized = target._isInitialized;
        target._targetInfoChanged(event.targetInfo);
        if (wasInitialized && previousURL !== target.url()) {
            this.emit("targetchanged" /* BrowserEmittedEvents.TargetChanged */, target);
        }
    }
    newPage({ context, logLevel, indent, pageIndex, onBrowserLog, onLog, }) {
        return this.#defaultContext.newPage({
            context,
            logLevel,
            indent,
            pageIndex,
            onBrowserLog,
            onLog,
        });
    }
    async _createPageInContext({ context, logLevel, indent, pageIndex, onBrowserLog, onLog, }) {
        const { value: { targetId }, } = await this.connection.send('Target.createTarget', {
            url: 'about:blank',
            browserContextId: undefined,
        });
        const target = this.#targets.get(targetId);
        if (!target) {
            throw new Error(`Missing target for page (id = ${targetId})`);
        }
        const initialized = await target._initializedPromise;
        if (!initialized) {
            throw new Error(`Failed to create target for page (id = ${targetId})`);
        }
        const page = await target.page({
            sourceMapGetter: context,
            logLevel,
            indent,
            pageIndex,
            onBrowserLog,
            onLog,
        });
        if (!page) {
            throw new Error(`Failed to create a page for context`);
        }
        return page;
    }
    targets() {
        return Array.from(this.#targets.values()).filter((target) => {
            return target._isInitialized;
        });
    }
    async waitForTarget(predicate, options = {}) {
        const { timeout = 30000 } = options;
        let resolve;
        let isResolved = false;
        const targetPromise = new Promise((x) => {
            resolve = x;
        });
        this.on("targetcreated" /* BrowserEmittedEvents.TargetCreated */, check);
        this.on("targetchanged" /* BrowserEmittedEvents.TargetChanged */, check);
        try {
            if (!timeout) {
                return await targetPromise;
            }
            this.targets().forEach(check);
            return await (0, util_1.waitWithTimeout)(targetPromise, 'target', timeout, this);
        }
        finally {
            this.off("targetcreated" /* BrowserEmittedEvents.TargetCreated */, check);
            this.off("targetchanged" /* BrowserEmittedEvents.TargetChanged */, check);
        }
        async function check(target) {
            if ((await predicate(target)) && !isResolved) {
                isResolved = true;
                resolve(target);
            }
        }
    }
    async pages() {
        const contextPages = await Promise.all(this.browserContexts().map((context) => {
            return context.pages();
        }));
        // Flatten array.
        return contextPages.reduce((acc, x) => {
            return acc.concat(x);
        }, []);
    }
    async close({ silent }) {
        await this.runner.closeProcess();
        (await this.pages()).forEach((page) => {
            page.emit("disposed" /* PageEmittedEvents.Disposed */);
            page.closed = true;
        });
        this.disconnect();
        this.emit(silent ? "closed-silent" /* BrowserEmittedEvents.ClosedSilent */ : "closed" /* BrowserEmittedEvents.Closed */);
    }
    disconnect() {
        this.connection.dispose();
    }
}
exports.HeadlessBrowser = HeadlessBrowser;
class BrowserContext extends EventEmitter_1.EventEmitter {
    #browser;
    constructor(browser) {
        super();
        this.#browser = browser;
    }
    targets() {
        return this.#browser.targets().filter((target) => {
            return target.browserContext() === this;
        });
    }
    waitForTarget(predicate, options = {}) {
        return this.#browser.waitForTarget((target) => {
            return target.browserContext() === this && predicate(target);
        }, options);
    }
    async pages() {
        const pages = await Promise.all(this.targets()
            .filter((target) => target.type() === 'page')
            .map((target) => target.expectPage()));
        return pages.filter((page) => {
            return Boolean(page);
        });
    }
    newPage({ context, logLevel, indent, pageIndex, onBrowserLog, onLog, }) {
        return this.#browser._createPageInContext({
            context,
            logLevel,
            indent,
            pageIndex,
            onBrowserLog,
            onLog,
        });
    }
    browser() {
        return this.#browser;
    }
}
exports.BrowserContext = BrowserContext;
