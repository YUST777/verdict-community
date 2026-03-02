"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseData = void 0;
const skip_1 = require("../../skip");
const may_skip_video_data_1 = require("../../state/may-skip-video-data");
const parseData = ({ state, }) => {
    const { iterator } = state;
    const ckSize = iterator.getUint32Le(); // chunkSize
    const box = {
        type: 'wav-data',
        dataSize: ckSize,
    };
    state.structure.getWavStructure().boxes.push(box);
    state.callbacks.tracks.setIsDone(state.logLevel);
    state.mediaSection.addMediaSection({
        size: ckSize,
        start: iterator.counter.getOffset(),
    });
    if ((0, may_skip_video_data_1.maySkipVideoData)({ state })) {
        // Skipping only in query mode
        return Promise.resolve((0, skip_1.makeSkip)(iterator.counter.getOffset() + ckSize));
    }
    return Promise.resolve(null);
};
exports.parseData = parseData;
