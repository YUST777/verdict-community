"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColorSegment = void 0;
const color_1 = require("../avc/color");
const traversal_1 = require("./traversal");
const parseColorSegment = (colourSegment) => {
    const transferCharacteristics = (0, traversal_1.getTransferCharacteristicsSegment)(colourSegment);
    const matrixCoefficients = (0, traversal_1.getMatrixCoefficientsSegment)(colourSegment);
    const primaries = (0, traversal_1.getPrimariesSegment)(colourSegment);
    const range = (0, traversal_1.getRangeSegment)(colourSegment);
    return {
        transfer: transferCharacteristics
            ? (0, color_1.getTransferCharacteristicsFromIndex)(transferCharacteristics.value.value)
            : null,
        matrix: matrixCoefficients
            ? (0, color_1.getMatrixCoefficientsFromIndex)(matrixCoefficients.value.value)
            : null,
        primaries: primaries ? (0, color_1.getPrimariesFromIndex)(primaries.value.value) : null,
        fullRange: (transferCharacteristics === null || transferCharacteristics === void 0 ? void 0 : transferCharacteristics.value.value) && (matrixCoefficients === null || matrixCoefficients === void 0 ? void 0 : matrixCoefficients.value.value)
            ? null
            : range
                ? Boolean(range === null || range === void 0 ? void 0 : range.value.value)
                : null,
    };
};
exports.parseColorSegment = parseColorSegment;
