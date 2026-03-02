"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRiffBox = void 0;
const parse_avih_1 = require("./parse-avih");
const parse_idx1_1 = require("./parse-idx1");
const parse_isft_1 = require("./parse-isft");
const parse_list_box_1 = require("./parse-list-box");
const parse_strh_1 = require("./parse-strh");
const parseRiffBox = ({ size, id, iterator, stateIfExpectingSideEffects, }) => {
    if (id === 'LIST') {
        return (0, parse_list_box_1.parseListBox)({
            size,
            iterator,
            stateIfExpectingSideEffects,
        });
    }
    if (id === 'ISFT') {
        return Promise.resolve((0, parse_isft_1.parseIsft)({ iterator, size }));
    }
    if (id === 'avih') {
        return Promise.resolve((0, parse_avih_1.parseAvih)({ iterator, size }));
    }
    if (id === 'strh') {
        return Promise.resolve((0, parse_strh_1.parseStrh)({ iterator, size }));
    }
    if (id === 'idx1') {
        return Promise.resolve((0, parse_idx1_1.parseIdx1)({ iterator, size }));
    }
    iterator.discard(size);
    const box = {
        type: 'riff-box',
        size,
        id,
    };
    return Promise.resolve(box);
};
exports.parseRiffBox = parseRiffBox;
