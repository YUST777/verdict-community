"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFlushPending = void 0;
const with_resolvers_1 = require("./create/with-resolvers");
const makeFlushPending = () => {
    const { promise, resolve, reject } = (0, with_resolvers_1.withResolvers)();
    return {
        promise,
        resolve,
        reject,
    };
};
exports.makeFlushPending = makeFlushPending;
