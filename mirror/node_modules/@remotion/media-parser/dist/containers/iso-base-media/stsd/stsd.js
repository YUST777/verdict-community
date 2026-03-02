"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStsd = void 0;
const samples_1 = require("./samples");
const parseStsd = async ({ offset, size, iterator, logLevel, contentLength, }) => {
    const version = iterator.getUint8();
    if (version !== 0) {
        throw new Error(`Unsupported STSD version ${version}`);
    }
    // flags, we discard them
    iterator.discard(3);
    const numberOfEntries = iterator.getUint32();
    const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);
    const boxes = await (0, samples_1.parseIsoFormatBoxes)({
        maxBytes: bytesRemainingInBox,
        logLevel,
        iterator,
        contentLength,
    });
    if (boxes.length !== numberOfEntries) {
        throw new Error(`Expected ${numberOfEntries} sample descriptions, got ${boxes.length}`);
    }
    return {
        type: 'stsd-box',
        boxSize: size,
        offset,
        numberOfEntries,
        samples: boxes,
    };
};
exports.parseStsd = parseStsd;
