"use strict";
/**
 * Copyright 2019 Google Inc. All rights reserved.
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
exports.DOMWorld = void 0;
const assert_1 = require("./assert");
const Errors_1 = require("./Errors");
const util_1 = require("./util");
class DOMWorld {
    #frame;
    #contextPromise = null;
    #contextResolveCallback = null;
    #detached = false;
    #waitTasks = new Set();
    get _waitTasks() {
        return this.#waitTasks;
    }
    constructor(frame) {
        // Keep own reference to client because it might differ from the FrameManager's
        // client for OOP iframes.
        this.#frame = frame;
        this._setContext(null);
    }
    frame() {
        return this.#frame;
    }
    _setContext(context) {
        var _a;
        if (context) {
            (0, assert_1.assert)(this.#contextResolveCallback, 'Execution Context has already been set.');
            (_a = this.#contextResolveCallback) === null || _a === void 0 ? void 0 : _a.call(null, context);
            this.#contextResolveCallback = null;
            for (const waitTask of this._waitTasks) {
                waitTask.rerun();
            }
        }
        else {
            this.#contextPromise = new Promise((fulfill) => {
                this.#contextResolveCallback = fulfill;
            });
        }
    }
    _hasContext() {
        return !this.#contextResolveCallback;
    }
    _detach() {
        this.#detached = true;
        for (const waitTask of this._waitTasks) {
            waitTask.terminate(new Error('waitForFunction failed: frame got detached.'));
        }
    }
    executionContext() {
        if (this.#detached) {
            throw new Error(`Execution context is not available in detached frame "${this.#frame.url()}" (are you trying to evaluate?)`);
        }
        if (this.#contextPromise === null) {
            throw new Error(`Execution content promise is missing`);
        }
        return this.#contextPromise;
    }
    async evaluateHandle(pageFunction, ...args) {
        const context = await this.executionContext();
        return context.evaluateHandle(pageFunction, ...args);
    }
    async evaluate(pageFunction, ...args) {
        const context = await this.executionContext();
        return context.evaluate(pageFunction, ...args);
    }
    waitForFunction({ browser, timeout, pageFunction, title, }) {
        return new WaitTask({
            domWorld: this,
            predicateBody: pageFunction,
            title,
            timeout,
            args: [],
            browser,
        });
    }
}
exports.DOMWorld = DOMWorld;
const noop = () => undefined;
class WaitTask {
    #domWorld;
    #timeout;
    #predicateBody;
    #args;
    #runCount = 0;
    #resolve = noop;
    #reject = noop;
    #timeoutTimer;
    #terminated = false;
    #browser;
    promise;
    constructor(options) {
        function getPredicateBody(predicateBody) {
            if ((0, util_1.isString)(predicateBody)) {
                return `return (${predicateBody});`;
            }
            return `return (${predicateBody})(...args);`;
        }
        this.#domWorld = options.domWorld;
        this.#timeout = options.timeout;
        this.#predicateBody = getPredicateBody(options.predicateBody);
        this.#args = options.args;
        this.#runCount = 0;
        this.#domWorld._waitTasks.add(this);
        this.promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
        // Since page navigation requires us to re-install the pageScript, we should track
        // timeout on our end.
        if (options.timeout) {
            const timeoutError = new Errors_1.TimeoutError(`waiting for ${options.title} failed: timeout ${options.timeout}ms exceeded`);
            this.#timeoutTimer = setTimeout(() => {
                return this.#reject(timeoutError);
            }, options.timeout);
        }
        this.#browser = options.browser;
        this.#browser.on("closed" /* BrowserEmittedEvents.Closed */, this.onBrowserClose);
        this.#browser.on("closed-silent" /* BrowserEmittedEvents.ClosedSilent */, this.onBrowserCloseSilent);
        this.rerun();
    }
    onBrowserClose = () => {
        return this.terminate(new Error('Browser was closed'));
    };
    onBrowserCloseSilent = () => {
        return this.terminate(null);
    };
    terminate(error) {
        this.#terminated = true;
        if (error) {
            this.#reject(error);
        }
        this.#cleanup();
    }
    async rerun() {
        const runCount = ++this.#runCount;
        let success = null;
        let error = null;
        const context = await this.#domWorld.executionContext();
        if (this.#terminated || runCount !== this.#runCount) {
            return;
        }
        if (this.#terminated || runCount !== this.#runCount) {
            return;
        }
        try {
            success = await context.evaluateHandle(waitForPredicatePageFunction, this.#predicateBody, this.#timeout, ...this.#args);
        }
        catch (error_) {
            error = error_;
        }
        if (this.#terminated || runCount !== this.#runCount) {
            if (success) {
                await success.dispose();
            }
            return;
        }
        // Ignore timeouts in pageScript - we track timeouts ourselves.
        // If the frame's execution context has already changed, `frame.evaluate` will
        // throw an error - ignore this predicate run altogether.
        if (!error &&
            (await this.#domWorld
                .evaluate((s) => {
                return !s;
            }, success)
                .catch(() => {
                return true;
            }))) {
            if (!success) {
                throw new Error('Assertion: result handle is not available');
            }
            await success.dispose();
            return;
        }
        if (error) {
            if (error.message.includes('TypeError: binding is not a function')) {
                return this.rerun();
            }
            // When frame is detached the task should have been terminated by the DOMWorld.
            // This can fail if we were adding this task while the frame was detached,
            // so we terminate here instead.
            if (error.message.includes('Execution context is not available in detached frame')) {
                this.terminate(new Error('waitForFunction failed: frame got detached.'));
                return;
            }
            // When the page is navigated, the promise is rejected.
            // We will try again in the new execution context.
            if (error.message.includes('Execution context was destroyed')) {
                return;
            }
            // We could have tried to evaluate in a context which was already
            // destroyed.
            if (error.message.includes('Cannot find context with specified id')) {
                return;
            }
            this.#reject(error);
        }
        else {
            if (!success) {
                throw new Error('Assertion: result handle is not available');
            }
            this.#resolve(success);
        }
        this.#cleanup();
    }
    #cleanup() {
        if (this.#timeoutTimer !== undefined) {
            clearTimeout(this.#timeoutTimer);
        }
        this.#browser.off("closed" /* BrowserEmittedEvents.Closed */, this.onBrowserClose);
        this.#browser.off("closed-silent" /* BrowserEmittedEvents.ClosedSilent */, this.onBrowserCloseSilent);
        if (this.#domWorld._waitTasks.size > 100) {
            throw new Error('Leak detected: Too many WaitTasks');
        }
        this.#domWorld._waitTasks.delete(this);
    }
}
function waitForPredicatePageFunction(predicateBody, timeout, ...args) {
    // eslint-disable-next-line no-new-func
    const predicate = new Function('...args', predicateBody);
    let timedOut = false;
    if (timeout) {
        setTimeout(() => {
            timedOut = true;
        }, timeout);
    }
    return new Promise((resolve) => {
        async function onRaf() {
            if (timedOut) {
                resolve(undefined);
                return;
            }
            const success = await predicate(...args);
            if (success) {
                resolve(success);
            }
            else {
                requestAnimationFrame(onRaf);
            }
        }
        onRaf();
    });
}
