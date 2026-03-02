"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideo = exports.canProcessVideo = void 0;
const process_stream_buffers_1 = require("./process-stream-buffers");
const canProcessVideo = ({ streamBuffer, }) => {
    const indexOfSeparator = streamBuffer.get2ndSubArrayIndex();
    if (indexOfSeparator === -1 || indexOfSeparator === 0) {
        return false;
    }
    return true;
};
exports.canProcessVideo = canProcessVideo;
const processVideo = async ({ programId, structure, streamBuffer, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }) => {
    const indexOfSeparator = streamBuffer.get2ndSubArrayIndex();
    if (indexOfSeparator === -1 || indexOfSeparator === 0) {
        throw new Error('cannot process avc stream');
    }
    const buf = streamBuffer.getBuffer();
    const packet = buf.slice(0, indexOfSeparator);
    const rest = buf.slice(indexOfSeparator);
    await (0, process_stream_buffers_1.processStreamBuffer)({
        streamBuffer: (0, process_stream_buffers_1.makeTransportStreamPacketBuffer)({
            offset: streamBuffer.offset,
            pesHeader: streamBuffer.pesHeader,
            // Replace the regular 0x00000001 with 0x00000002 to avoid confusion with other 0x00000001 (?)
            buffers: packet,
        }),
        programId,
        structure,
        sampleCallbacks,
        logLevel,
        onAudioTrack,
        onVideoTrack,
        transportStream,
        makeSamplesStartAtZero,
        avcState,
    });
    return rest;
};
exports.processVideo = processVideo;
