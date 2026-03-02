"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partitionedNextFrameToRenderState = exports.nextFrameToRenderState = void 0;
const render_partitions_1 = require("./render-partitions");
const nextFrameToRenderState = ({ allFramesAndExtraFrames, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
concurrencyOrFramesToRender: _concurrency, }) => {
    const rendered = new Map();
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getNextFrame: (_pageIndex) => {
            const nextFrame = allFramesAndExtraFrames.find((frame) => {
                return !rendered.has(frame);
            });
            if (nextFrame === undefined) {
                throw new Error('No more frames to render');
            }
            rendered.set(nextFrame, true);
            return nextFrame;
        },
        returnFrame: (frame) => {
            rendered.delete(frame);
        },
    };
};
exports.nextFrameToRenderState = nextFrameToRenderState;
const partitionedNextFrameToRenderState = ({ allFramesAndExtraFrames, concurrencyOrFramesToRender: concurrency, }) => {
    const partitions = (0, render_partitions_1.renderPartitions)({
        frames: allFramesAndExtraFrames,
        concurrency,
    });
    return {
        getNextFrame: (pageIndex) => {
            return partitions.getNextFrame(pageIndex);
        },
        returnFrame: () => {
            throw new Error('retrying failed frames for partitioned rendering is not supported. Disable partitioned rendering.');
        },
    };
};
exports.partitionedNextFrameToRenderState = partitionedNextFrameToRenderState;
