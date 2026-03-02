"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMfraAtom = void 0;
const buffer_iterator_1 = require("../../../iterator/buffer-iterator");
const getMfraAtom = async ({ src, contentLength, readerInterface, controller, parentSize, logLevel, prefetchCache, }) => {
    const result = await readerInterface.read({
        controller,
        range: [contentLength - parentSize, contentLength - 1],
        src,
        logLevel,
        prefetchCache,
    });
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: new Uint8Array(),
        maxBytes: parentSize,
        logLevel: 'error',
    });
    while (true) {
        const res = await result.reader.reader.read();
        if (res.value) {
            iterator.addData(res.value);
        }
        if (res.done) {
            break;
        }
    }
    return iterator;
};
exports.getMfraAtom = getMfraAtom;
