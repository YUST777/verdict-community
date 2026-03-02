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
exports.Frame = exports.FrameManager = exports.FrameManagerEmittedEvents = void 0;
const assert_1 = require("./assert");
const Connection_1 = require("./Connection");
const DOMWorld_1 = require("./DOMWorld");
const EventEmitter_1 = require("./EventEmitter");
const ExecutionContext_1 = require("./ExecutionContext");
const flaky_errors_1 = require("./flaky-errors");
const LifecycleWatcher_1 = require("./LifecycleWatcher");
const NetworkManager_1 = require("./NetworkManager");
const util_1 = require("./util");
const UTILITY_WORLD_NAME = '__puppeteer_utility_world__';
exports.FrameManagerEmittedEvents = {
    FrameNavigated: Symbol('FrameManager.FrameNavigated'),
    FrameDetached: Symbol('FrameManager.FrameDetached'),
    FrameSwapped: Symbol('FrameManager.FrameSwapped'),
    LifecycleEvent: Symbol('FrameManager.LifecycleEvent'),
    FrameNavigatedWithinDocument: Symbol('FrameManager.FrameNavigatedWithinDocument'),
    ExecutionContextCreated: Symbol('FrameManager.ExecutionContextCreated'),
    ExecutionContextDestroyed: Symbol('FrameManager.ExecutionContextDestroyed'),
};
class FrameManager extends EventEmitter_1.EventEmitter {
    #page;
    #networkManager;
    #frames = new Map();
    #contextIdToContext = new Map();
    #isolatedWorlds = new Set();
    #mainFrame;
    #client;
    get _client() {
        return this.#client;
    }
    constructor(client, page, indent, logLevel) {
        super();
        this.#client = client;
        this.#page = page;
        this.#networkManager = new NetworkManager_1.NetworkManager(client, this, indent, logLevel);
        this.setupEventListeners(this.#client);
    }
    setupEventListeners(session) {
        session.on('Page.frameAttached', (event) => {
            this.#onFrameAttached(session, event.frameId, event.parentFrameId);
        });
        session.on('Page.frameNavigated', (event) => {
            this.#onFrameNavigated(event.frame);
        });
        session.on('Page.navigatedWithinDocument', (event) => {
            this.#onFrameNavigatedWithinDocument(event.frameId, event.url);
        });
        session.on('Page.frameDetached', (event) => {
            this.#onFrameDetached(event.frameId, event.reason);
        });
        session.on('Page.frameStartedLoading', (event) => {
            this.#onFrameStartedLoading(event.frameId);
        });
        session.on('Page.frameStoppedLoading', (event) => {
            this.#onFrameStoppedLoading(event.frameId);
        });
        session.on('Runtime.executionContextCreated', (event) => {
            this.#onExecutionContextCreated(event.context, session);
        });
        session.on('Runtime.executionContextDestroyed', (event) => {
            this.#onExecutionContextDestroyed(event.executionContextId, session);
        });
        session.on('Runtime.executionContextsCleared', () => {
            this.#onExecutionContextsCleared(session);
        });
        session.on('Page.lifecycleEvent', (event) => {
            this.#onLifecycleEvent(event);
        });
        session.on('Target.attachedToTarget', (event) => {
            this.#onAttachedToTarget(event);
        });
        session.on('Target.detachedFromTarget', (event) => {
            this.#onDetachedFromTarget(event);
        });
    }
    async initialize(client = this.#client) {
        try {
            const result = await Promise.all([
                client.send('Page.enable'),
                client.send('Page.getFrameTree'),
                client === this.#client
                    ? Promise.resolve()
                    : client.send('Target.setAutoAttach', {
                        autoAttach: true,
                        waitForDebuggerOnStart: false,
                        flatten: true,
                    }),
            ]);
            const { value: { frameTree }, } = result[1];
            this.#handleFrameTree(client, frameTree);
            await Promise.all([
                client.send('Page.setLifecycleEventsEnabled', { enabled: true }),
                client.send('Runtime.enable').then(() => {
                    return this._ensureIsolatedWorld(client, UTILITY_WORLD_NAME);
                }),
                client === this.#client
                    ? this.#networkManager.initialize()
                    : Promise.resolve(),
            ]);
        }
        catch (error) {
            // The target might have been closed before the initialization finished.
            if ((0, util_1.isErrorLike)(error) && (0, flaky_errors_1.isTargetClosedErr)(error)) {
                return;
            }
            throw error;
        }
    }
    networkManager() {
        return this.#networkManager;
    }
    async navigateFrame(frame, url, timeout, options = {}) {
        const { referer = undefined, waitUntil = 'load' } = options;
        const watcher = new LifecycleWatcher_1.LifecycleWatcher(this, frame, waitUntil, timeout);
        let error = await Promise.race([
            navigate(this.#client, url, referer, frame._id),
            watcher.timeoutOrTerminationPromise(),
        ]);
        if (!error) {
            error = await Promise.race([
                watcher.timeoutOrTerminationPromise(),
                watcher.newDocumentNavigationPromise(),
                watcher.sameDocumentNavigationPromise(),
            ]);
        }
        watcher.dispose();
        if (error) {
            throw error;
        }
        return watcher.navigationResponse();
        async function navigate(client, _url, referrer, frameId) {
            try {
                const { value: response } = await client.send('Page.navigate', {
                    url: _url,
                    referrer,
                    frameId,
                });
                return response.errorText
                    ? new Error(`${response.errorText} at ${_url}`)
                    : null;
            }
            catch (_error) {
                if ((0, util_1.isErrorLike)(_error)) {
                    return _error;
                }
                throw _error;
            }
        }
    }
    async #onAttachedToTarget(event) {
        if (event.targetInfo.type !== 'iframe') {
            return;
        }
        const frame = this.#frames.get(event.targetInfo.targetId);
        const connection = Connection_1.Connection.fromSession(this.#client);
        (0, assert_1.assert)(connection);
        const session = connection.session(event.sessionId);
        (0, assert_1.assert)(session);
        if (frame) {
            frame._updateClient(session);
        }
        this.setupEventListeners(session);
        await this.initialize(session);
    }
    #onDetachedFromTarget(event) {
        if (!event.targetId) {
            return;
        }
        const frame = this.#frames.get(event.targetId);
        if (frame === null || frame === void 0 ? void 0 : frame.isOOPFrame()) {
            // When an OOP iframe is removed from the page, it
            // will only get a Target.detachedFromTarget event.
            this.#removeFramesRecursively(frame);
        }
    }
    #onLifecycleEvent(event) {
        const frame = this.#frames.get(event.frameId);
        if (!frame) {
            return;
        }
        frame._onLifecycleEvent(event.loaderId, event.name);
        this.emit(exports.FrameManagerEmittedEvents.LifecycleEvent, frame);
    }
    #onFrameStartedLoading(frameId) {
        const frame = this.#frames.get(frameId);
        if (!frame) {
            return;
        }
        frame._onLoadingStarted();
    }
    #onFrameStoppedLoading(frameId) {
        const frame = this.#frames.get(frameId);
        if (!frame) {
            return;
        }
        frame._onLoadingStopped();
        this.emit(exports.FrameManagerEmittedEvents.LifecycleEvent, frame);
    }
    #handleFrameTree(session, frameTree) {
        if (frameTree.frame.parentId) {
            this.#onFrameAttached(session, frameTree.frame.id, frameTree.frame.parentId);
        }
        this.#onFrameNavigated(frameTree.frame);
        if (!frameTree.childFrames) {
            return;
        }
        for (const child of frameTree.childFrames) {
            this.#handleFrameTree(session, child);
        }
    }
    page() {
        return this.#page;
    }
    mainFrame() {
        (0, assert_1.assert)(this.#mainFrame, 'Requesting main frame too early!');
        return this.#mainFrame;
    }
    frames() {
        return Array.from(this.#frames.values());
    }
    frame(frameId) {
        return this.#frames.get(frameId) || null;
    }
    #onFrameAttached(session, frameId, parentFrameId) {
        if (this.#frames.has(frameId)) {
            const _frame = this.#frames.get(frameId);
            if (session && _frame.isOOPFrame()) {
                // If an OOP iframes becomes a normal iframe again
                // it is first attached to the parent page before
                // the target is removed.
                _frame._updateClient(session);
            }
            return;
        }
        (0, assert_1.assert)(parentFrameId);
        const parentFrame = this.#frames.get(parentFrameId);
        (0, assert_1.assert)(parentFrame);
        const frame = new Frame(this, parentFrame, frameId, session);
        this.#frames.set(frame._id, frame);
    }
    #onFrameNavigated(framePayload) {
        const isMainFrame = !framePayload.parentId;
        let frame = isMainFrame
            ? this.#mainFrame
            : this.#frames.get(framePayload.id);
        (0, assert_1.assert)(isMainFrame || frame, 'We either navigate top level or have old version of the navigated frame');
        // Detach all child frames first.
        if (frame) {
            for (const child of frame.childFrames()) {
                this.#removeFramesRecursively(child);
            }
        }
        // Update or create main frame.
        if (isMainFrame) {
            if (frame) {
                // Update frame id to retain frame identity on cross-process navigation.
                this.#frames.delete(frame._id);
                frame._id = framePayload.id;
            }
            else {
                // Initial main frame navigation.
                frame = new Frame(this, null, framePayload.id, this.#client);
            }
            this.#frames.set(framePayload.id, frame);
            this.#mainFrame = frame;
        }
        // Update frame payload.
        (0, assert_1.assert)(frame);
        frame._navigated(framePayload);
        this.emit(exports.FrameManagerEmittedEvents.FrameNavigated, frame);
    }
    async _ensureIsolatedWorld(session, name) {
        const key = `${session.id()}:${name}`;
        if (this.#isolatedWorlds.has(key)) {
            return;
        }
        this.#isolatedWorlds.add(key);
        await session.send('Page.addScriptToEvaluateOnNewDocument', {
            source: `//# sourceURL=${ExecutionContext_1.EVALUATION_SCRIPT_URL}`,
            worldName: name,
        });
        // Frames might be removed before we send this.
        await Promise.all(this.frames()
            .filter((frame) => {
            return frame._client() === session;
        })
            .map((frame) => {
            return session
                .send('Page.createIsolatedWorld', {
                frameId: frame._id,
                worldName: name,
                grantUniveralAccess: true,
            })
                .catch(() => undefined);
        }));
    }
    #onFrameNavigatedWithinDocument(frameId, url) {
        const frame = this.#frames.get(frameId);
        if (!frame) {
            return;
        }
        frame._navigatedWithinDocument(url);
        this.emit(exports.FrameManagerEmittedEvents.FrameNavigatedWithinDocument, frame);
        this.emit(exports.FrameManagerEmittedEvents.FrameNavigated, frame);
    }
    #onFrameDetached(frameId, reason) {
        const frame = this.#frames.get(frameId);
        if (reason === 'remove') {
            // Only remove the frame if the reason for the detached event is
            // an actual removement of the frame.
            // For frames that become OOP iframes, the reason would be 'swap'.
            if (frame) {
                this.#removeFramesRecursively(frame);
            }
        }
        else if (reason === 'swap') {
            this.emit(exports.FrameManagerEmittedEvents.FrameSwapped, frame);
        }
    }
    #onExecutionContextCreated(contextPayload, session) {
        const auxData = contextPayload.auxData;
        const frameId = auxData === null || auxData === void 0 ? void 0 : auxData.frameId;
        const frame = typeof frameId === 'string' ? this.#frames.get(frameId) : undefined;
        let world;
        if (frame) {
            // Only care about execution contexts created for the current session.
            if (frame._client() !== session) {
                return;
            }
            if (contextPayload.auxData && Boolean(contextPayload.auxData.isDefault)) {
                world = frame._mainWorld;
            }
            else if (contextPayload.name === UTILITY_WORLD_NAME &&
                !frame._secondaryWorld._hasContext()) {
                // In case of multiple sessions to the same target, there's a race between
                // connections so we might end up creating multiple isolated worlds.
                // We can use either.
                world = frame._secondaryWorld;
            }
        }
        const context = new ExecutionContext_1.ExecutionContext((frame === null || frame === void 0 ? void 0 : frame._client()) || this.#client, contextPayload, world);
        if (world) {
            world._setContext(context);
        }
        const key = `${session.id()}:${contextPayload.id}`;
        this.#contextIdToContext.set(key, context);
    }
    #onExecutionContextDestroyed(executionContextId, session) {
        const key = `${session.id()}:${executionContextId}`;
        const context = this.#contextIdToContext.get(key);
        if (!context) {
            return;
        }
        this.#contextIdToContext.delete(key);
        if (context._world) {
            context._world._setContext(null);
        }
    }
    #onExecutionContextsCleared(session) {
        for (const [key, context] of this.#contextIdToContext.entries()) {
            // Make sure to only clear execution contexts that belong
            // to the current session.
            if (context._client !== session) {
                continue;
            }
            if (context._world) {
                context._world._setContext(null);
            }
            this.#contextIdToContext.delete(key);
        }
    }
    executionContextById(contextId, session = this.#client) {
        const key = `${session.id()}:${contextId}`;
        const context = this.#contextIdToContext.get(key);
        (0, assert_1.assert)(context, 'INTERNAL ERROR: missing context with id = ' + contextId);
        return context;
    }
    #removeFramesRecursively(frame) {
        for (const child of frame.childFrames()) {
            this.#removeFramesRecursively(child);
        }
        frame._detach();
        this.#frames.delete(frame._id);
        this.emit(exports.FrameManagerEmittedEvents.FrameDetached, frame);
    }
}
exports.FrameManager = FrameManager;
class Frame {
    #parentFrame;
    #url = '';
    #client;
    _frameManager;
    _id;
    _loaderId = '';
    _name;
    _hasStartedLoading = false;
    _lifecycleEvents = new Set();
    _mainWorld;
    _secondaryWorld;
    _childFrames;
    constructor(frameManager, parentFrame, frameId, client) {
        this._frameManager = frameManager;
        this.#parentFrame = parentFrame !== null && parentFrame !== void 0 ? parentFrame : null;
        this.#url = '';
        this._id = frameId;
        this._loaderId = '';
        this._childFrames = new Set();
        if (this.#parentFrame) {
            this.#parentFrame._childFrames.add(this);
        }
        this._updateClient(client);
    }
    _updateClient(client) {
        this.#client = client;
        this._mainWorld = new DOMWorld_1.DOMWorld(this);
        this._secondaryWorld = new DOMWorld_1.DOMWorld(this);
    }
    isOOPFrame() {
        return this.#client !== this._frameManager._client;
    }
    goto(url, timeout, options = {}) {
        return this._frameManager.navigateFrame(this, url, timeout, options);
    }
    _client() {
        return this.#client;
    }
    /**
     * @returns a promise that resolves to the frame's default execution context.
     */
    executionContext() {
        return this._mainWorld.executionContext();
    }
    evaluateHandle(pageFunction, ...args) {
        return this._mainWorld.evaluateHandle(pageFunction, ...args);
    }
    evaluate(pageFunction, ...args) {
        return this._mainWorld.evaluate(pageFunction, ...args);
    }
    url() {
        return this.#url;
    }
    childFrames() {
        return Array.from(this._childFrames);
    }
    _navigated(framePayload) {
        this._name = framePayload.name;
        this.#url = `${framePayload.url}${framePayload.urlFragment || ''}`;
    }
    _navigatedWithinDocument(url) {
        this.#url = url;
    }
    _onLifecycleEvent(loaderId, name) {
        if (name === 'init') {
            this._loaderId = loaderId;
            this._lifecycleEvents.clear();
        }
        this._lifecycleEvents.add(name);
    }
    _onLoadingStopped() {
        this._lifecycleEvents.add('load');
    }
    _onLoadingStarted() {
        this._hasStartedLoading = true;
    }
    _detach() {
        this._mainWorld._detach();
        this._secondaryWorld._detach();
        if (this.#parentFrame) {
            this.#parentFrame._childFrames.delete(this);
        }
        this.#parentFrame = null;
    }
}
exports.Frame = Frame;
