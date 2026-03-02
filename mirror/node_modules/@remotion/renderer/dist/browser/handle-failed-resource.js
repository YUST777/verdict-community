"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFailedResource = void 0;
const logger_1 = require("../logger");
const handleFailedResource = ({ extraInfo, logLevel, indent, request, event, }) => {
    var _a;
    var _b;
    const firstExtraInfo = (_b = extraInfo[0]) !== null && _b !== void 0 ? _b : null;
    logger_1.Log.warn({ indent, logLevel }, `Browser failed to load ${request._url} (${event.type}): ${event.errorText}`);
    if (firstExtraInfo) {
        logger_1.Log.warn({ indent, logLevel }, `HTTP status code: ${firstExtraInfo.statusCode}, headers:`);
        logger_1.Log.warn({ indent, logLevel }, JSON.stringify(firstExtraInfo.headers, null, 2));
    }
    if (event.errorText === 'net::ERR_FAILED' &&
        event.type === 'Fetch' &&
        ((_a = request._url) === null || _a === void 0 ? void 0 : _a.includes('/proxy'))) {
        logger_1.Log.warn({ indent, logLevel }, 'This could be caused by Chrome rejecting the request because the disk space is low.');
        logger_1.Log.warn({ indent, logLevel }, 'This could be caused by Chrome rejecting the request because the disk space is low.');
        logger_1.Log.warn({ indent, logLevel }, 'Consider increasing the disk size of your Lambda function.');
    }
};
exports.handleFailedResource = handleFailedResource;
