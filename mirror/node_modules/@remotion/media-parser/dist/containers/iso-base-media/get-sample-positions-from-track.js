"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSamplePositionsFromTrack = void 0;
const collect_sample_positions_from_moof_boxes_1 = require("./collect-sample-positions-from-moof-boxes");
const collect_sample_positions_from_trak_1 = require("./collect-sample-positions-from-trak");
const traversal_1 = require("./traversal");
const getSamplePositionsFromTrack = ({ trakBox, moofBoxes, moofComplete, trexBoxes, }) => {
    const tkhdBox = (0, traversal_1.getTkhdBox)(trakBox);
    if (!tkhdBox) {
        throw new Error('Expected tkhd box in trak box');
    }
    if (moofBoxes.length > 0) {
        const { samplePositions } = (0, collect_sample_positions_from_moof_boxes_1.collectSamplePositionsFromMoofBoxes)({
            moofBoxes,
            tkhdBox,
            isComplete: moofComplete,
            trexBoxes,
        });
        return {
            samplePositions: samplePositions.map((s) => s.samples).flat(1),
            isComplete: moofComplete,
        };
    }
    return {
        samplePositions: (0, collect_sample_positions_from_trak_1.collectSamplePositionsFromTrak)(trakBox),
        isComplete: true,
    };
};
exports.getSamplePositionsFromTrack = getSamplePositionsFromTrack;
