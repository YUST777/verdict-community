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
exports.Target = void 0;
const BrowserPage_1 = require("./BrowserPage");
const isPagetTarget = (target) => {
    return (target.type === 'page' ||
        target.type === 'background_page' ||
        target.type === 'webview');
};
class Target {
    #browserContext;
    #targetInfo;
    #sessionFactory;
    #defaultViewport;
    #pagePromise;
    _initializedPromise;
    _initializedCallback;
    _isClosedPromise;
    _closedCallback;
    _isInitialized;
    _targetId;
    constructor(targetInfo, browserContext, sessionFactory, defaultViewport) {
        this.#targetInfo = targetInfo;
        this.#browserContext = browserContext;
        this._targetId = targetInfo.targetId;
        this.#sessionFactory = sessionFactory;
        this.#defaultViewport = defaultViewport;
        this._initializedPromise = new Promise((fulfill) => {
            this._initializedCallback = fulfill;
        }).then((success) => {
            if (!success) {
                return false;
            }
            const opener = this.opener();
            if (!opener || !opener.#pagePromise || this.type() !== 'page') {
                return true;
            }
            return true;
        });
        this._isClosedPromise = new Promise((fulfill) => {
            this._closedCallback = fulfill;
        });
        this._isInitialized =
            !isPagetTarget(this.#targetInfo) || this.#targetInfo.url !== '';
        if (this._isInitialized) {
            this._initializedCallback(true);
        }
    }
    /**
     * Creates a Chrome Devtools Protocol session attached to the target.
     */
    createCDPSession() {
        return this.#sessionFactory();
    }
    _getTargetInfo() {
        return this.#targetInfo;
    }
    /**
     * If the target is not of type `"page"` or `"background_page"`, returns `null`.
     */
    async page({ sourceMapGetter, logLevel, indent, pageIndex, onBrowserLog, onLog, }) {
        var _a;
        if (isPagetTarget(this.#targetInfo) && !this.#pagePromise) {
            this.#pagePromise = this.#sessionFactory().then((client) => {
                var _a;
                return BrowserPage_1.Page._create({
                    client,
                    target: this,
                    defaultViewport: (_a = this.#defaultViewport) !== null && _a !== void 0 ? _a : null,
                    browser: this.browser(),
                    sourceMapGetter,
                    logLevel,
                    indent,
                    pageIndex,
                    onBrowserLog,
                    onLog,
                });
            });
        }
        return (_a = (await this.#pagePromise)) !== null && _a !== void 0 ? _a : null;
    }
    async expectPage() {
        var _a;
        return (_a = (await this.#pagePromise)) !== null && _a !== void 0 ? _a : null;
    }
    url() {
        return this.#targetInfo.url;
    }
    /**
     * Identifies what kind of target this is.
     *
     * @remarks
     *
     * See {@link https://developer.chrome.com/extensions/background_pages | docs} for more info about background pages.
     */
    type() {
        const { type } = this.#targetInfo;
        if (type === 'page' ||
            type === 'background_page' ||
            type === 'service_worker' ||
            type === 'shared_worker' ||
            type === 'browser' ||
            type === 'webview') {
            return type;
        }
        return 'other';
    }
    /**
     * Get the browser the target belongs to.
     */
    browser() {
        return this.#browserContext.browser();
    }
    /**
     * Get the browser context the target belongs to.
     */
    browserContext() {
        return this.#browserContext;
    }
    /**
     * Get the target that opened this target. Top-level targets return `null`.
     */
    opener() {
        const { openerId } = this.#targetInfo;
        if (!openerId) {
            return;
        }
        return this.browser()._targets.get(openerId);
    }
    _targetInfoChanged(targetInfo) {
        this.#targetInfo = targetInfo;
        if (!this._isInitialized &&
            (!isPagetTarget(this.#targetInfo) || this.#targetInfo.url !== '')) {
            this._isInitialized = true;
            this._initializedCallback(true);
        }
    }
}
exports.Target = Target;
