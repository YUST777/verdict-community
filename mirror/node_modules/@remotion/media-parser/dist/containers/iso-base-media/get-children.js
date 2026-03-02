"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsoBaseMediaChildren = void 0;
const process_box_1 = require("./process-box");
const getIsoBaseMediaChildren = async ({ size, iterator, logLevel, onlyIfMoovAtomExpected, contentLength, }) => {
    const boxes = [];
    const initial = iterator.counter.getOffset();
    while (iterator.counter.getOffset() < size + initial) {
        const parsed = await (0, process_box_1.processBox)({
            iterator,
            logLevel,
            onlyIfMoovAtomExpected,
            onlyIfMdatAtomExpected: null,
            contentLength,
        });
        if (parsed.type !== 'box') {
            throw new Error('Expected box');
        }
        boxes.push(parsed.box);
    }
    if (iterator.counter.getOffset() > size + initial) {
        throw new Error(`read too many bytes - size: ${size}, read: ${iterator.counter.getOffset() - initial}. initial offset: ${initial}`);
    }
    return boxes;
};
exports.getIsoBaseMediaChildren = getIsoBaseMediaChildren;
