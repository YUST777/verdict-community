"use strict";
/*
    Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = registerStackTraceLimit;
exports.unregister = unregisterStackTraceLimit;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
let stackTraceRegistered = false;
// Default: https://docs.microsoft.com/en-us/scripting/javascript/reference/stacktracelimit-property-error-javascript
let restoreStackTraceValue = 10;
const MAX_STACK_LENGTH = 50;
function registerStackTraceLimit(limit = MAX_STACK_LENGTH) {
    if (stackTraceRegistered) {
        return;
    }
    try {
        restoreStackTraceValue = Error.stackTraceLimit;
        Error.stackTraceLimit = limit;
        stackTraceRegistered = true;
    }
    catch (_a) {
        // Not all browsers support this so we don't care if it errors
    }
}
function unregisterStackTraceLimit() {
    if (!stackTraceRegistered) {
        return;
    }
    try {
        Error.stackTraceLimit = restoreStackTraceValue;
        stackTraceRegistered = false;
    }
    catch (_a) {
        // Not all browsers support this so we don't care if it errors
    }
}
