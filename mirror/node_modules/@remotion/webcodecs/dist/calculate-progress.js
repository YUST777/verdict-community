"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProgress = void 0;
const calculateProgress = ({ millisecondsWritten, expectedOutputDurationInMs, }) => {
    if (expectedOutputDurationInMs === null) {
        return null;
    }
    return millisecondsWritten / expectedOutputDurationInMs;
};
exports.calculateProgress = calculateProgress;
