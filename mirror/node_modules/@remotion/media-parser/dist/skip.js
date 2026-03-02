"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFetchMoreData = exports.makeSkip = void 0;
const makeSkip = (skipTo) => ({
    action: 'skip',
    skipTo,
});
exports.makeSkip = makeSkip;
const makeFetchMoreData = (bytesNeeded) => ({
    action: 'fetch-more-data',
    bytesNeeded,
});
exports.makeFetchMoreData = makeFetchMoreData;
