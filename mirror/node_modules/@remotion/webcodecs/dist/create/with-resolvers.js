"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withResolversAndWaitForReturn = exports.withResolvers = void 0;
const withResolvers = function () {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve, reject: reject };
};
exports.withResolvers = withResolvers;
const withResolversAndWaitForReturn = () => {
    const { promise, reject, resolve } = (0, exports.withResolvers)();
    const { promise: returnPromise, resolve: resolveReturn } = (0, exports.withResolvers)();
    return {
        getPromiseToImmediatelyReturn: () => {
            resolveReturn(undefined);
            return promise;
        },
        reject: (reason) => {
            returnPromise.then(() => reject(reason));
        },
        resolve,
    };
};
exports.withResolversAndWaitForReturn = withResolversAndWaitForReturn;
