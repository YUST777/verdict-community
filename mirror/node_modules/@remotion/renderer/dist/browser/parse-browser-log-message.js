"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBrowserLogMessage = void 0;
const parseBrowserLogMessage = (input) => {
    var _a;
    // Chrome <144: [MMDD/HHMMSS.UUUUUU:LEVEL:LOCATION(LINE)] message
    // Chrome 144+:  [MMDD/HHMMSS.UUUUUU:LEVEL:LOCATION:LINE] message
    const format = /^\[([0-9]{4})\/([0-9]{6})\.([0-9]{6}):([A-Z]+):(.*?)(?:\(([0-9]+)\)|:([0-9]+))\](.*)/;
    const match = input.match(format);
    if (!match) {
        return null;
    }
    const date = match[1];
    const day = parseInt(date.slice(0, 2), 10);
    const month = parseInt(date.slice(2, 4), 10);
    const time = match[2];
    const hour = parseInt(time.slice(0, 2), 10);
    const minute = parseInt(time.slice(2, 4), 10);
    const seconds = parseInt(time.slice(4, 6), 10);
    const microseconds = parseInt(match[3], 10);
    const level = match[4];
    const location = match[5];
    const lineNumber = parseInt((_a = match[6]) !== null && _a !== void 0 ? _a : match[7], 10);
    const message = match[8].trim();
    return {
        day,
        month,
        hour,
        minute,
        seconds,
        microseconds,
        level,
        location,
        lineNumber,
        message,
    };
};
exports.parseBrowserLogMessage = parseBrowserLogMessage;
