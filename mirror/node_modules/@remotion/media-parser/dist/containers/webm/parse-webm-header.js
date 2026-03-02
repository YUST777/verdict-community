"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWebm = void 0;
const skip_1 = require("../../skip");
const may_skip_video_data_1 = require("../../state/may-skip-video-data");
const get_byte_for_cues_1 = require("./get-byte-for-cues");
const segments_1 = require("./segments");
const state_for_processing_1 = require("./state-for-processing");
// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
const parseWebm = async (state) => {
    const structure = state.structure.getMatroskaStructure();
    const { iterator } = state;
    const offset = iterator.counter.getOffset();
    const isInsideSegment = state.webm.isInsideSegment(iterator);
    const isInsideCluster = state.webm.isInsideCluster(offset);
    const results = await (0, segments_1.expectSegment)({
        iterator,
        logLevel: state.logLevel,
        statesForProcessing: (0, state_for_processing_1.selectStatesForProcessing)(state),
        isInsideSegment,
        mediaSectionState: state.mediaSection,
    });
    if ((results === null || results === void 0 ? void 0 : results.type) === 'SeekHead') {
        const position = (0, get_byte_for_cues_1.getByteForSeek)({ seekHeadSegment: results, offset });
        if (position !== null) {
            state.webm.cues.triggerLoad(position, offset);
        }
    }
    if (results === null) {
        return null;
    }
    if (isInsideCluster) {
        if ((0, may_skip_video_data_1.maySkipVideoData)({ state })) {
            return (0, skip_1.makeSkip)(Math.min(state.contentLength, isInsideCluster.size + isInsideCluster.start));
        }
        const segments = structure.boxes.filter((box) => box.type === 'Segment');
        const segment = segments[isInsideCluster.segment];
        if (!segment) {
            throw new Error('Expected segment');
        }
        const clusters = segment.value.find((box) => box.type === 'Cluster');
        if (!clusters) {
            throw new Error('Expected cluster');
        }
        // let's not add it to the cluster
        if (results.type !== 'Block' && results.type !== 'SimpleBlock') {
            clusters.value.push(results);
        }
    }
    else if (isInsideSegment) {
        const segments = structure.boxes.filter((box) => box.type === 'Segment');
        const segment = segments[isInsideSegment.index];
        if (!segment) {
            throw new Error('Expected segment');
        }
        segment.value.push(results);
    }
    else {
        structure.boxes.push(results);
    }
    return null;
};
exports.parseWebm = parseWebm;
