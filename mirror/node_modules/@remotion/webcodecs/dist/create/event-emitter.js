"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoEventEmitter = void 0;
class IoEventEmitter {
    listeners = {
        input: [],
        output: [],
        processed: [],
        progress: [],
    };
    addEventListener(name, callback) {
        this.listeners[name].push(callback);
    }
    removeEventListener(name, callback) {
        this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback) => {
            callback({ detail: context });
        });
    }
}
exports.IoEventEmitter = IoEventEmitter;
