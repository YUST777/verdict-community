"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CDPSession = exports.CDPSessionEmittedEvents = exports.Connection = void 0;
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
const logger_1 = require("../logger");
const Errors_1 = require("./Errors");
const EventEmitter_1 = require("./EventEmitter");
const ConnectionEmittedEvents = {
    Disconnected: Symbol('Connection.Disconnected'),
};
class Connection extends EventEmitter_1.EventEmitter {
    transport;
    #lastId = 0;
    #sessions = new Map();
    #closed = false;
    #callbacks = new Map();
    constructor(transport) {
        super();
        this.transport = transport;
        this.transport.onmessage = this.#onMessage.bind(this);
        this.transport.onclose = this.#onClose.bind(this);
    }
    static fromSession(session) {
        return session.connection();
    }
    session(sessionId) {
        return this.#sessions.get(sessionId) || null;
    }
    send(method, ...paramArgs) {
        // There is only ever 1 param arg passed, but the Protocol defines it as an
        // array of 0 or 1 items See this comment:
        // https://github.com/ChromeDevTools/devtools-protocol/pull/113#issuecomment-412603285
        // which explains why the protocol defines the params this way for better
        // type-inference.
        // So now we check if there are any params or not and deal with them accordingly.
        const params = paramArgs.length ? paramArgs[0] : undefined;
        const id = this._rawSend({ method, params });
        return new Promise((resolve, reject) => {
            var _a;
            this.#callbacks.set(id, {
                resolve,
                reject,
                method,
                returnSize: true,
                stack: (_a = new Error().stack) !== null && _a !== void 0 ? _a : '',
                fn: method + JSON.stringify(params),
            });
        });
    }
    _rawSend(message) {
        const id = ++this.#lastId;
        const stringifiedMessage = JSON.stringify({ ...message, id });
        this.transport.send(stringifiedMessage);
        return id;
    }
    #onMessage(message) {
        const object = JSON.parse(message);
        if (object.method === 'Target.attachedToTarget') {
            const { sessionId } = object.params;
            const session = new CDPSession(this, object.params.targetInfo.type, sessionId);
            this.#sessions.set(sessionId, session);
            this.emit('sessionattached', session);
            const parentSession = this.#sessions.get(object.sessionId);
            if (parentSession) {
                parentSession.emit('sessionattached', session);
            }
        }
        else if (object.method === 'Target.detachedFromTarget') {
            const session = this.#sessions.get(object.params.sessionId);
            if (session) {
                session._onClosed();
                this.#sessions.delete(object.params.sessionId);
                this.emit('sessiondetached', session);
                const parentSession = this.#sessions.get(object.sessionId);
                if (parentSession) {
                    parentSession.emit('sessiondetached', session);
                }
            }
        }
        if (object.sessionId) {
            const session = this.#sessions.get(object.sessionId);
            if (session) {
                session._onMessage(object, message.length);
            }
        }
        else if (object.id) {
            const callback = this.#callbacks.get(object.id);
            // Callbacks could be all rejected if someone has called `.dispose()`.
            if (callback) {
                this.#callbacks.delete(object.id);
                if (object.error) {
                    callback.reject(createProtocolError(callback.method, object));
                }
                else if (callback.returnSize) {
                    callback.resolve({ value: object.result, size: message.length });
                }
                else {
                    callback.resolve(object.result);
                }
            }
        }
        else {
            this.emit(object.method, object.params);
        }
    }
    #onClose() {
        if (this.#closed) {
            return;
        }
        this.transport.onmessage = undefined;
        this.transport.onclose = undefined;
        for (const callback of this.#callbacks.values()) {
            callback.reject(rewriteError(new Errors_1.ProtocolError(), `Protocol error (${callback.method}): Target closed. https://www.remotion.dev/docs/target-closed`));
        }
        this.#callbacks.clear();
        for (const session of this.#sessions.values()) {
            session._onClosed();
        }
        this.#sessions.clear();
        this.emit(ConnectionEmittedEvents.Disconnected);
    }
    dispose() {
        this.#onClose();
        this.transport.close();
    }
    /**
     * @param targetInfo - The target info
     * @returns The CDP session that is created
     */
    async createSession(targetInfo) {
        const { value: { sessionId }, } = await this.send('Target.attachToTarget', {
            targetId: targetInfo.targetId,
            flatten: true,
        });
        const session = this.#sessions.get(sessionId);
        if (!session) {
            throw new Error('CDPSession creation failed.');
        }
        return session;
    }
}
exports.Connection = Connection;
exports.CDPSessionEmittedEvents = {
    Disconnected: Symbol('CDPSession.Disconnected'),
};
class CDPSession extends EventEmitter_1.EventEmitter {
    #sessionId;
    #targetType;
    #callbacks = new Map();
    #connection;
    constructor(connection, targetType, sessionId) {
        super();
        this.#connection = connection;
        this.#targetType = targetType;
        this.#sessionId = sessionId;
    }
    connection() {
        return this.#connection;
    }
    send(method, ...paramArgs) {
        if (!this.#connection) {
            return Promise.reject(new Error(`Protocol error (${method}): Session closed. Most likely the ${this.#targetType} has been closed.`));
        }
        // See the comment in Connection#send explaining why we do this.
        const params = paramArgs.length ? paramArgs[0] : undefined;
        const id = this.#connection._rawSend({
            sessionId: this.#sessionId,
            method,
            params,
        });
        return new Promise((resolve, reject) => {
            var _a;
            if (this.#callbacks.size > 100) {
                for (const callback of this.#callbacks.values()) {
                    logger_1.Log.info({ indent: false, logLevel: 'info' }, callback.fn);
                }
                throw new Error('Leak detected: Too many callbacks');
            }
            this.#callbacks.set(id, {
                resolve,
                reject,
                method,
                returnSize: true,
                stack: (_a = new Error().stack) !== null && _a !== void 0 ? _a : '',
                fn: method + JSON.stringify(params),
            });
        });
    }
    _onMessage(object, size) {
        const callback = object.id ? this.#callbacks.get(object.id) : undefined;
        if (object.id && callback) {
            this.#callbacks.delete(object.id);
            if (object.error) {
                callback.reject(createProtocolError(callback.method, object));
            }
            else if (callback.returnSize) {
                callback.resolve({ value: object.result, size });
            }
            else {
                callback.resolve(object.result);
            }
        }
        else {
            this.emit(object.method, object.params);
        }
    }
    _onClosed() {
        this.#connection = undefined;
        for (const callback of this.#callbacks.values()) {
            callback.reject(rewriteError(new Errors_1.ProtocolError(), `Protocol error (${callback.method}): Target closed. https://www.remotion.dev/docs/target-closed`));
        }
        this.#callbacks.clear();
        this.emit(exports.CDPSessionEmittedEvents.Disconnected);
    }
    id() {
        return this.#sessionId;
    }
}
exports.CDPSession = CDPSession;
function createProtocolError(method, object) {
    let message = `Protocol error (${method}): ${object.error.message}`;
    if ('data' in object.error) {
        message += ` ${object.error.data}`;
    }
    return rewriteError(new Errors_1.ProtocolError(), message, object.error.message);
}
function rewriteError(error, message, originalMessage) {
    error.message = message;
    error.originalMessage = originalMessage !== null && originalMessage !== void 0 ? originalMessage : error.originalMessage;
    return error;
}
