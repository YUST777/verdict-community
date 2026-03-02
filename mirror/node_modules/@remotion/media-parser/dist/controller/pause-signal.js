"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePauseSignal = void 0;
const makePauseSignal = (emitter) => {
    const waiterFns = [];
    let paused = false;
    return {
        pause: () => {
            if (paused) {
                return;
            }
            emitter.dispatchPause();
            paused = true;
        },
        resume: () => {
            if (!paused) {
                return;
            }
            paused = false;
            for (const waiterFn of waiterFns) {
                waiterFn();
            }
            waiterFns.length = 0;
            emitter.dispatchResume();
        },
        waitUntilResume: () => {
            return new Promise((resolve) => {
                if (!paused) {
                    resolve();
                }
                else {
                    waiterFns.push(resolve);
                }
            });
        },
    };
};
exports.makePauseSignal = makePauseSignal;
