"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webFileReader = exports.webFileCreateAdjacentFileSource = exports.webFileReadWholeAsText = exports.webFileReadContent = void 0;
const webFileReadContent = ({ src, range, controller }) => {
    if (typeof src === 'string' || src instanceof URL) {
        throw new Error('`inputTypeFileReader` only supports `File` objects');
    }
    const part = range === null
        ? src
        : typeof range === 'number'
            ? src.slice(range)
            : src.slice(range[0], range[1] + 1);
    const stream = part.stream();
    const streamReader = stream.getReader();
    if (controller) {
        controller._internals.signal.addEventListener('abort', () => {
            streamReader.cancel();
        }, { once: true });
    }
    return Promise.resolve({
        reader: {
            reader: streamReader,
            async abort() {
                try {
                    await streamReader.cancel();
                }
                catch (_a) { }
                return Promise.resolve();
            },
        },
        contentLength: src.size,
        name: src instanceof File ? src.name : src.toString(),
        supportsContentRange: true,
        contentType: src.type,
        needsContentRange: true,
    });
};
exports.webFileReadContent = webFileReadContent;
const webFileReadWholeAsText = () => {
    throw new Error('`webFileReader` cannot read auxiliary files.');
};
exports.webFileReadWholeAsText = webFileReadWholeAsText;
const webFileCreateAdjacentFileSource = () => {
    throw new Error('`webFileReader` cannot create adjacent file sources.');
};
exports.webFileCreateAdjacentFileSource = webFileCreateAdjacentFileSource;
exports.webFileReader = {
    read: exports.webFileReadContent,
    readWholeAsText: exports.webFileReadWholeAsText,
    createAdjacentFileSource: exports.webFileCreateAdjacentFileSource,
    preload: () => {
        // doing nothing, it's just for when fetching over the network
    },
};
