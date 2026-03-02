"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFlakyNetworkError = exports.isTargetClosedErr = void 0;
const isTargetClosedErr = (error) => {
    var _a, _b;
    return (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('Target closed')) ||
        ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('Session closed')));
};
exports.isTargetClosedErr = isTargetClosedErr;
const isFlakyNetworkError = (error) => {
    var _a, _b, _c, _d, _e, _f, _g;
    return (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('ERR_CONNECTION_REFUSED')) ||
        ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('ERR_CONNECTION_RESET')) ||
        ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0 ? void 0 : _c.includes('ERR_CONNECTION_TIMED_OUT')) ||
        ((_d = error === null || error === void 0 ? void 0 : error.message) === null || _d === void 0 ? void 0 : _d.includes('ERR_INTERNET_DISCONNECTED')) ||
        ((_e = error === null || error === void 0 ? void 0 : error.message) === null || _e === void 0 ? void 0 : _e.includes('ERR_NAME_RESOLUTION_FAILED')) ||
        ((_f = error === null || error === void 0 ? void 0 : error.message) === null || _f === void 0 ? void 0 : _f.includes('ERR_ADDRESS_UNREACHABLE')) ||
        ((_g = error === null || error === void 0 ? void 0 : error.message) === null || _g === void 0 ? void 0 : _g.includes('ERR_NETWORK_CHANGED')));
};
exports.isFlakyNetworkError = isFlakyNetworkError;
