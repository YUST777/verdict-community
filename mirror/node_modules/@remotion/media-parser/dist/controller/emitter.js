"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MediaParserEmitter_markAsReady;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaParserEmitter = void 0;
const with_resolvers_1 = require("../with-resolvers");
class MediaParserEmitter {
    constructor() {
        this.listeners = {
            pause: [],
            resume: [],
            abort: [],
            seek: [],
        };
        _MediaParserEmitter_markAsReady.set(this, void 0);
        this.markAsReady = () => {
            __classPrivateFieldGet(this, _MediaParserEmitter_markAsReady, "f").call(this);
        };
        this.addEventListener = (name, callback) => {
            this.listeners[name].push(callback);
        };
        this.removeEventListener = (name, callback) => {
            this.listeners[name] = this.listeners[name].filter((l) => l !== callback);
        };
        this.dispatchPause = () => {
            this.readyPromise = this.readyPromise.then(() => {
                this.dispatchEvent('pause', undefined);
            });
        };
        this.dispatchResume = () => {
            this.readyPromise = this.readyPromise.then(() => {
                this.dispatchEvent('resume', undefined);
            });
        };
        this.dispatchAbort = (reason) => {
            this.readyPromise = this.readyPromise.then(() => {
                this.dispatchEvent('abort', { reason });
            });
        };
        this.dispatchSeek = (seek) => {
            this.readyPromise = this.readyPromise.then(() => {
                this.dispatchEvent('seek', { seek });
            });
        };
        const { promise, resolve } = (0, with_resolvers_1.withResolvers)();
        this.readyPromise = promise;
        __classPrivateFieldSet(this, _MediaParserEmitter_markAsReady, resolve, "f");
    }
    dispatchEvent(dispatchName, context) {
        this.listeners[dispatchName].forEach((callback) => {
            callback({ detail: context });
        });
    }
}
exports.MediaParserEmitter = MediaParserEmitter;
_MediaParserEmitter_markAsReady = new WeakMap();
