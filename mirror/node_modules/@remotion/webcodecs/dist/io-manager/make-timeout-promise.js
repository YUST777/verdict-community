"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTimeoutPromise = void 0;
const with_resolvers_1 = require("../create/with-resolvers");
const makeTimeoutPromise = ({ label, ms, controller, }) => {
    const { promise, reject, resolve } = (0, with_resolvers_1.withResolvers)();
    let timeout = null;
    const set = () => {
        timeout = setTimeout(() => {
            reject(new Error(`${label()} (timed out after ${ms}ms)`));
        }, ms);
    };
    set();
    const onPause = () => {
        if (timeout) {
            clearTimeout(timeout);
        }
    };
    const onResume = () => {
        set();
    };
    if (controller) {
        controller.addEventListener('pause', onPause);
        controller.addEventListener('resume', onResume);
    }
    return {
        timeoutPromise: promise,
        clear: () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            resolve();
            if (controller) {
                controller.removeEventListener('pause', onPause);
                controller.removeEventListener('resume', onResume);
            }
        },
    };
};
exports.makeTimeoutPromise = makeTimeoutPromise;
