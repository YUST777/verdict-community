"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkEventManager = void 0;
class NetworkEventManager {
    #requestWillBeSentMap = new Map();
    #requestPausedMap = new Map();
    #httpRequestsMap = new Map();
    #responseReceivedExtraInfoMap = new Map();
    #queuedRedirectInfoMap = new Map();
    #queuedEventGroupMap = new Map();
    #failedLoadInfoMap = new Map();
    forget(networkRequestId) {
        this.#requestWillBeSentMap.delete(networkRequestId);
        this.#requestPausedMap.delete(networkRequestId);
        this.#queuedEventGroupMap.delete(networkRequestId);
        this.#queuedRedirectInfoMap.delete(networkRequestId);
        this.#responseReceivedExtraInfoMap.delete(networkRequestId);
        this.#failedLoadInfoMap.delete(networkRequestId);
    }
    queueFailedLoadInfo(networkRequestId, event) {
        this.#failedLoadInfoMap.set(networkRequestId, { event });
    }
    getFailedLoadInfo(networkRequestId) {
        var _a;
        return (_a = this.#failedLoadInfoMap.get(networkRequestId)) === null || _a === void 0 ? void 0 : _a.event;
    }
    getResponseExtraInfo(networkRequestId) {
        if (!this.#responseReceivedExtraInfoMap.has(networkRequestId)) {
            this.#responseReceivedExtraInfoMap.set(networkRequestId, []);
        }
        return this.#responseReceivedExtraInfoMap.get(networkRequestId);
    }
    queuedRedirectInfo(fetchRequestId) {
        if (!this.#queuedRedirectInfoMap.has(fetchRequestId)) {
            this.#queuedRedirectInfoMap.set(fetchRequestId, []);
        }
        return this.#queuedRedirectInfoMap.get(fetchRequestId);
    }
    queueRedirectInfo(fetchRequestId, redirectInfo) {
        this.queuedRedirectInfo(fetchRequestId).push(redirectInfo);
    }
    takeQueuedRedirectInfo(fetchRequestId) {
        return this.queuedRedirectInfo(fetchRequestId).shift();
    }
    storeRequestWillBeSent(networkRequestId, event) {
        this.#requestWillBeSentMap.set(networkRequestId, event);
    }
    getRequestWillBeSent(networkRequestId) {
        return this.#requestWillBeSentMap.get(networkRequestId);
    }
    forgetRequestWillBeSent(networkRequestId) {
        this.#requestWillBeSentMap.delete(networkRequestId);
    }
    storeRequestPaused(networkRequestId, event) {
        this.#requestPausedMap.set(networkRequestId, event);
    }
    getRequest(networkRequestId) {
        return this.#httpRequestsMap.get(networkRequestId);
    }
    storeRequest(networkRequestId, request) {
        this.#httpRequestsMap.set(networkRequestId, request);
    }
    forgetRequest(networkRequestId) {
        this.#httpRequestsMap.delete(networkRequestId);
    }
    getQueuedEventGroup(networkRequestId) {
        return this.#queuedEventGroupMap.get(networkRequestId);
    }
    queueEventGroup(networkRequestId, event) {
        this.#queuedEventGroupMap.set(networkRequestId, event);
    }
    forgetQueuedEventGroup(networkRequestId) {
        this.#queuedEventGroupMap.delete(networkRequestId);
    }
}
exports.NetworkEventManager = NetworkEventManager;
