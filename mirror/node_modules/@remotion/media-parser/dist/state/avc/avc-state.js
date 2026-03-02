"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avcState = void 0;
const max_buffer_size_1 = require("../../containers/avc/max-buffer-size");
const avcState = () => {
    let prevPicOrderCntLsb = 0;
    let prevPicOrderCntMsb = 0;
    let sps = null;
    let maxFramesInBuffer = null;
    return {
        getPrevPicOrderCntLsb() {
            return prevPicOrderCntLsb;
        },
        getPrevPicOrderCntMsb() {
            return prevPicOrderCntMsb;
        },
        setPrevPicOrderCntLsb(value) {
            prevPicOrderCntLsb = value;
        },
        setPrevPicOrderCntMsb(value) {
            prevPicOrderCntMsb = value;
        },
        setSps(value) {
            const macroblockBufferSize = (0, max_buffer_size_1.macroBlocksPerFrame)(value);
            const maxBufferSize = (0, max_buffer_size_1.maxMacroblockBufferSize)(value);
            const maxFrames = Math.min(16, Math.floor(maxBufferSize / macroblockBufferSize));
            maxFramesInBuffer = maxFrames;
            sps = value;
        },
        getSps() {
            return sps;
        },
        getMaxFramesInBuffer() {
            return maxFramesInBuffer;
        },
        clear() {
            maxFramesInBuffer = null;
            sps = null;
            prevPicOrderCntLsb = 0;
            prevPicOrderCntMsb = 0;
        },
    };
};
exports.avcState = avcState;
