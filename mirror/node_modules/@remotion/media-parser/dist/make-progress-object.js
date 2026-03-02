"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProgressObject = void 0;
const makeProgressObject = (state) => {
    return {
        bytes: state.iterator.counter.getOffset(),
        percentage: state.contentLength
            ? state.iterator.counter.getOffset() / state.contentLength
            : null,
        totalBytes: state.contentLength,
    };
};
exports.makeProgressObject = makeProgressObject;
