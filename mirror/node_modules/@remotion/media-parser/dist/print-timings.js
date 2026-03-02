"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTimings = void 0;
const log_1 = require("./log");
const printTimings = (state) => {
    log_1.Log.verbose(state.logLevel, `Time iterating over file: ${state.timings.timeIterating}ms`);
    log_1.Log.verbose(state.logLevel, `Time fetching data: ${state.timings.timeReadingData}ms`);
    log_1.Log.verbose(state.logLevel, `Time seeking: ${state.timings.timeSeeking}ms`);
    log_1.Log.verbose(state.logLevel, `Time checking if done: ${state.timings.timeCheckingIfDone}ms`);
    log_1.Log.verbose(state.logLevel, `Time freeing data: ${state.timings.timeFreeingData}ms`);
    log_1.Log.verbose(state.logLevel, `Time in parse loop: ${state.timings.timeInParseLoop}ms`);
};
exports.printTimings = printTimings;
