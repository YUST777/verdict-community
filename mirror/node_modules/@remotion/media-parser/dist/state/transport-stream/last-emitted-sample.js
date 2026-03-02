"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastEmittedSampleState = void 0;
const lastEmittedSampleState = () => {
    let lastEmittedSample = null;
    return {
        setLastEmittedSample: (sample) => {
            lastEmittedSample = sample;
        },
        getLastEmittedSample: () => lastEmittedSample,
        resetLastEmittedSample: () => {
            lastEmittedSample = null;
        },
    };
};
exports.lastEmittedSampleState = lastEmittedSampleState;
