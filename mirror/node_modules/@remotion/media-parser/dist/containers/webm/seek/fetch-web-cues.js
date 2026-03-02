"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWebmCues = void 0;
const buffer_iterator_1 = require("../../../iterator/buffer-iterator");
const segments_1 = require("../segments");
const format_cues_1 = require("./format-cues");
const fetchWebmCues = async ({ src, readerInterface, controller, position, logLevel, prefetchCache, }) => {
    const result = await readerInterface.read({
        controller,
        range: position,
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
    const segment = await (0, segments_1.expectSegment)({
        iterator,
        logLevel,
        statesForProcessing: null,
        isInsideSegment: null,
        mediaSectionState: null,
    });
    iterator.destroy();
    if (!(segment === null || segment === void 0 ? void 0 : segment.value)) {
        return null;
    }
    return (0, format_cues_1.formatCues)(segment.value);
};
exports.fetchWebmCues = fetchWebmCues;
