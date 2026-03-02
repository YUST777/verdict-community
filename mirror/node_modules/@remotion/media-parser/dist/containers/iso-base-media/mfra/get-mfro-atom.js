"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMfroAtom = void 0;
const buffer_iterator_1 = require("../../../iterator/buffer-iterator");
const getMfroAtom = async ({ src, contentLength, readerInterface, controller, logLevel, prefetchCache, }) => {
    const result = await readerInterface.read({
        controller,
        range: [contentLength - 16, contentLength - 1],
        src,
        logLevel,
        prefetchCache,
    });
    const { value } = await result.reader.reader.read();
    if (!value) {
        return null;
    }
    result.reader.abort();
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: value,
        maxBytes: value.length,
        logLevel: 'error',
    });
    const size = iterator.getUint32();
    if (size !== 16) {
        iterator.destroy();
        return null;
    }
    const atom = iterator.getByteString(4, false);
    if (atom !== 'mfro') {
        iterator.destroy();
        return null;
    }
    const version = iterator.getUint8();
    if (version !== 0) {
        iterator.destroy();
        return null;
    }
    // flags
    iterator.discard(3);
    const parentSize = iterator.getUint32();
    iterator.destroy();
    return parentSize;
};
exports.getMfroAtom = getMfroAtom;
