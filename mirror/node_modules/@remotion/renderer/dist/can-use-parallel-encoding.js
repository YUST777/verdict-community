"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShouldUsePartitionedRendering = exports.canUseParallelEncoding = void 0;
const is_audio_codec_1 = require("./is-audio-codec");
const canUseParallelEncoding = (codec) => {
    if ((0, exports.getShouldUsePartitionedRendering)()) {
        return false;
    }
    if ((0, is_audio_codec_1.isAudioCodec)(codec)) {
        return false;
    }
    return codec === 'h264' || codec === 'h264-mkv' || codec === 'h265';
};
exports.canUseParallelEncoding = canUseParallelEncoding;
const getShouldUsePartitionedRendering = () => {
    const shouldUsePartitionedRendering = process.env.REMOTION_PARTITIONED_RENDERING === 'true';
    return shouldUsePartitionedRendering;
};
exports.getShouldUsePartitionedRendering = getShouldUsePartitionedRendering;
