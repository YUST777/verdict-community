"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withResolvers = void 0;
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
