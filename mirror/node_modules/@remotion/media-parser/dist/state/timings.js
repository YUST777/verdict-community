"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timingsState = void 0;
const timingsState = () => {
    return {
        timeIterating: 0,
        timeReadingData: 0,
        timeSeeking: 0,
        timeCheckingIfDone: 0,
        timeFreeingData: 0,
        timeInParseLoop: 0,
    };
};
exports.timingsState = timingsState;
