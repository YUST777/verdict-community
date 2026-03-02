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
exports.LifecycleWatcher = void 0;
const assert_1 = require("./assert");
const Connection_1 = require("./Connection");
const Errors_1 = require("./Errors");
const FrameManager_1 = require("./FrameManager");
const NetworkManager_1 = require("./NetworkManager");
const util_1 = require("./util");
const puppeteerToProtocolLifecycle = new Map([['load', 'load']]);
const noop = () => undefined;
class LifecycleWatcher {
    #expectedLifecycle;
    #frameManager;
    #frame;
    #timeout;
    #navigationRequest = null;
    #eventListeners;
    #sameDocumentNavigationCompleteCallback = noop;
    #sameDocumentNavigationPromise = new Promise((fulfill) => {
        this.#sameDocumentNavigationCompleteCallback = fulfill;
    });
    #lifecycleCallback = noop;
    #lifecyclePromise = new Promise((fulfill) => {
        this.#lifecycleCallback = fulfill;
    });
    #newDocumentNavigationCompleteCallback = noop;
    #newDocumentNavigationPromise = new Promise((fulfill) => {
        this.#newDocumentNavigationCompleteCallback = fulfill;
    });
    #terminationCallback = noop;
    #terminationPromise = new Promise((fulfill) => {
        this.#terminationCallback = fulfill;
    });
    #timeoutPromise;
    #maximumTimer;
    #hasSameDocumentNavigation;
    #newDocumentNavigation;
    #swapped;
    constructor(frameManager, frame, waitUntil, timeout) {
        const protocolEvent = puppeteerToProtocolLifecycle.get(waitUntil);
        (0, assert_1.assert)(protocolEvent, 'Unknown value for options.waitUntil: ' + waitUntil);
        this.#expectedLifecycle = [waitUntil];
        this.#frameManager = frameManager;
        this.#frame = frame;
        this.#timeout = timeout;
        this.#eventListeners = [
            (0, util_1.addEventListener)(frameManager._client, Connection_1.CDPSessionEmittedEvents.Disconnected, this.#terminate.bind(this, new Error('Navigation failed because browser has disconnected!'))),
            (0, util_1.addEventListener)(this.#frameManager, FrameManager_1.FrameManagerEmittedEvents.LifecycleEvent, this.#checkLifecycleComplete.bind(this)),
            (0, util_1.addEventListener)(this.#frameManager, FrameManager_1.FrameManagerEmittedEvents.FrameNavigatedWithinDocument, this.#navigatedWithinDocument.bind(this)),
            (0, util_1.addEventListener)(this.#frameManager, FrameManager_1.FrameManagerEmittedEvents.FrameNavigated, this.#navigated.bind(this)),
            (0, util_1.addEventListener)(this.#frameManager, FrameManager_1.FrameManagerEmittedEvents.FrameSwapped, this.#frameSwapped.bind(this)),
            (0, util_1.addEventListener)(this.#frameManager, FrameManager_1.FrameManagerEmittedEvents.FrameDetached, this.#onFrameDetached.bind(this)),
            (0, util_1.addEventListener)(this.#frameManager.networkManager(), NetworkManager_1.NetworkManagerEmittedEvents.Request, this.#onRequest.bind(this)),
        ];
        this.#timeoutPromise = this.#createTimeoutPromise();
        this.#checkLifecycleComplete();
    }
    #onRequest(request) {
        if (request.frame() !== this.#frame || !request.isNavigationRequest()) {
            return;
        }
        this.#navigationRequest = request;
    }
    #onFrameDetached(frame) {
        if (this.#frame === frame) {
            this.#terminationCallback.call(null, new Error('Navigating frame was detached'));
            return;
        }
        this.#checkLifecycleComplete();
    }
    navigationResponse() {
        if (!this.#navigationRequest) {
            return null;
        }
        const res = this.#navigationRequest.response();
        return res;
    }
    #terminate(error) {
        this.#terminationCallback.call(null, error);
    }
    sameDocumentNavigationPromise() {
        return this.#sameDocumentNavigationPromise;
    }
    newDocumentNavigationPromise() {
        return this.#newDocumentNavigationPromise;
    }
    lifecyclePromise() {
        return this.#lifecyclePromise;
    }
    timeoutOrTerminationPromise() {
        return Promise.race([this.#timeoutPromise, this.#terminationPromise]);
    }
    async #createTimeoutPromise() {
        if (!this.#timeout) {
            return new Promise(noop);
        }
        const errorMessage = 'Navigation timeout of ' + this.#timeout + ' ms exceeded';
        await new Promise((fulfill) => {
            this.#maximumTimer = setTimeout(fulfill, this.#timeout);
        });
        return new Errors_1.TimeoutError(errorMessage);
    }
    #navigatedWithinDocument(frame) {
        if (frame !== this.#frame) {
            return;
        }
        this.#hasSameDocumentNavigation = true;
        this.#checkLifecycleComplete();
    }
    #navigated(frame) {
        if (frame !== this.#frame) {
            return;
        }
        this.#newDocumentNavigation = true;
        this.#checkLifecycleComplete();
    }
    #frameSwapped(frame) {
        if (frame !== this.#frame) {
            return;
        }
        this.#swapped = true;
        this.#checkLifecycleComplete();
    }
    #checkLifecycleComplete() {
        // We expect navigation to commit.
        if (!checkLifecycle(this.#frame, this.#expectedLifecycle)) {
            return;
        }
        this.#lifecycleCallback();
        if (this.#hasSameDocumentNavigation) {
            this.#sameDocumentNavigationCompleteCallback();
        }
        if (this.#swapped || this.#newDocumentNavigation) {
            this.#newDocumentNavigationCompleteCallback();
        }
        function checkLifecycle(frame, expectedLifecycle) {
            for (const event of expectedLifecycle) {
                if (!frame._lifecycleEvents.has(event)) {
                    return false;
                }
            }
            for (const child of frame.childFrames()) {
                if (child._hasStartedLoading &&
                    !checkLifecycle(child, expectedLifecycle)) {
                    return false;
                }
            }
            return true;
        }
    }
    dispose() {
        (0, util_1.removeEventListeners)(this.#eventListeners);
        if (this.#maximumTimer !== undefined) {
            clearTimeout(this.#maximumTimer);
        }
    }
}
exports.LifecycleWatcher = LifecycleWatcher;
