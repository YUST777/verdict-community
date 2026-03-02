"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseListBox = void 0;
const expect_riff_box_1 = require("./expect-riff-box");
const parseListBox = async ({ size, iterator, stateIfExpectingSideEffects, }) => {
    const counter = iterator.counter.getOffset();
    const listType = iterator.getByteString(4, false);
    if (listType === 'movi') {
        throw new Error('should not be handled here');
    }
    const boxes = [];
    const maxOffset = counter + size;
    while (iterator.counter.getOffset() < maxOffset) {
        const box = await (0, expect_riff_box_1.expectRiffBox)({
            iterator,
            stateIfExpectingSideEffects,
        });
        if (box === null) {
            throw new Error('Unexpected result');
        }
        if (stateIfExpectingSideEffects) {
            await (0, expect_riff_box_1.postProcessRiffBox)(stateIfExpectingSideEffects, box);
        }
        boxes.push(box);
    }
    return {
        type: 'list-box',
        listType,
        children: boxes,
    };
};
exports.parseListBox = parseListBox;
