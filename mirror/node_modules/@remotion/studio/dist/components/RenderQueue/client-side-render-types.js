"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRestoredClientJob = void 0;
const isRestoredClientJob = (job) => {
    return !('inputProps' in job);
};
exports.isRestoredClientJob = isRestoredClientJob;
