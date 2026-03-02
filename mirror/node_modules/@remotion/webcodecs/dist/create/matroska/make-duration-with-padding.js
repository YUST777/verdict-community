"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDurationWithPadding = void 0;
const matroska_utils_1 = require("./matroska-utils");
const makeDurationWithPadding = (newDuration) => {
    return (0, matroska_utils_1.makeMatroskaBytes)({
        type: 'Duration',
        value: {
            value: newDuration,
            size: '64',
        },
        minVintWidth: 8,
    });
};
exports.makeDurationWithPadding = makeDurationWithPadding;
