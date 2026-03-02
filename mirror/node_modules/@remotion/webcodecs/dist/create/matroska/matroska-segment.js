"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatroskaSegment = exports.MATROSKA_SEGMENT_MIN_VINT_WIDTH = void 0;
const matroska_utils_1 = require("./matroska-utils");
exports.MATROSKA_SEGMENT_MIN_VINT_WIDTH = 8;
const createMatroskaSegment = (children) => {
    return (0, matroska_utils_1.makeMatroskaBytes)({
        type: 'Segment',
        value: children,
        minVintWidth: exports.MATROSKA_SEGMENT_MIN_VINT_WIDTH,
    });
};
exports.createMatroskaSegment = createMatroskaSegment;
