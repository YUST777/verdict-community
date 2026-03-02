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
exports.ElementHandle = exports.JSHandle = void 0;
exports._createJSHandle = _createJSHandle;
const util_1 = require("./util");
function _createJSHandle(context, remoteObject) {
    const frame = context.frame();
    if (remoteObject.subtype === 'node' && frame) {
        return new ElementHandle(context, context._client, remoteObject);
    }
    return new JSHandle(context, context._client, remoteObject);
}
class JSHandle {
    #client;
    #disposed = false;
    #context;
    #remoteObject;
    get _disposed() {
        return this.#disposed;
    }
    get _remoteObject() {
        return this.#remoteObject;
    }
    get _context() {
        return this.#context;
    }
    constructor(context, client, remoteObject) {
        this.#context = context;
        this.#client = client;
        this.#remoteObject = remoteObject;
    }
    executionContext() {
        return this.#context;
    }
    evaluateHandle(pageFunction, ...args) {
        return this.executionContext().evaluateHandle(pageFunction, this, ...args);
    }
    asElement() {
        return null;
    }
    async dispose() {
        if (this.#disposed) {
            return;
        }
        this.#disposed = true;
        await (0, util_1.releaseObject)(this.#client, this.#remoteObject);
    }
    toString() {
        if (this.#remoteObject.objectId) {
            const type = this.#remoteObject.subtype || this.#remoteObject.type;
            return 'JSHandle@' + type;
        }
        return (0, util_1.valueFromRemoteObject)(this.#remoteObject);
    }
}
exports.JSHandle = JSHandle;
class ElementHandle extends JSHandle {
    asElement() {
        return this;
    }
}
exports.ElementHandle = ElementHandle;
