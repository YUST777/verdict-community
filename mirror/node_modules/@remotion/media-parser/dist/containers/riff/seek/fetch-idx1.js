"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIdx1 = void 0;
const buffer_iterator_1 = require("../../../iterator/buffer-iterator");
const log_1 = require("../../../log");
const expect_riff_box_1 = require("../expect-riff-box");
const fetchIdx1 = async ({ src, readerInterface, controller, position, logLevel, prefetchCache, contentLength, }) => {
    log_1.Log.verbose(logLevel, 'Making request to fetch idx1 from ', src, 'position', position);
    const result = await readerInterface.read({
        controller,
        range: position,
        src,
        logLevel,
        prefetchCache,
    });
    if (result.contentLength === null) {
        throw new Error('Content length is null');
    }
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: new Uint8Array(),
        maxBytes: contentLength - position + 1,
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
    const box = await (0, expect_riff_box_1.expectRiffBox)({
        iterator,
        stateIfExpectingSideEffects: null,
    });
    iterator.destroy();
    if (box === null || box.type !== 'idx1-box') {
        throw new Error('Expected idx1-box');
    }
    // only store video chunks, those end with "dc", e.g. "01dc"
    return {
        entries: box.entries.filter((entry) => entry.id.endsWith('dc')),
        videoTrackIndex: box.videoTrackIndex,
    };
};
exports.fetchIdx1 = fetchIdx1;
