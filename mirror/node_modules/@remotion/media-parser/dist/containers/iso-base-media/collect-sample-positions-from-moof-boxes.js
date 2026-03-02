"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSamplePositionsFromMoofBoxes = void 0;
const samples_from_moof_1 = require("../../samples-from-moof");
const collectSamplePositionsFromMoofBoxes = ({ moofBoxes, tkhdBox, isComplete, trexBoxes, }) => {
    const samplePositions = moofBoxes.map((m, index) => {
        const isLastFragment = index === moofBoxes.length - 1 && isComplete;
        return {
            isLastFragment,
            samples: (0, samples_from_moof_1.getSamplesFromMoof)({
                moofBox: m,
                trackId: tkhdBox.trackId,
                trexBoxes,
            }),
        };
    });
    return { samplePositions, isComplete };
};
exports.collectSamplePositionsFromMoofBoxes = collectSamplePositionsFromMoofBoxes;
