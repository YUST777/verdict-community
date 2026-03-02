"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPRequest = void 0;
class HTTPRequest {
    _requestId;
    _response = null;
    _url = null;
    _fromMemoryCache = false;
    #isNavigationRequest;
    #frame;
    constructor(frame, event) {
        this._requestId = event.requestId;
        this.#isNavigationRequest =
            event.requestId === event.loaderId && event.type === 'Document';
        this.#frame = frame;
        this._url = event.request.url;
    }
    response() {
        return this._response;
    }
    frame() {
        return this.#frame;
    }
    isNavigationRequest() {
        return this.#isNavigationRequest;
    }
}
exports.HTTPRequest = HTTPRequest;
