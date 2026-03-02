"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAudio = exports.canProcessAudio = void 0;
const adts_header_1 = require("./adts-header");
const process_stream_buffers_1 = require("./process-stream-buffers");
const canProcessAudio = ({ streamBuffer, }) => {
    var _a, _b;
    const expectedLength = (_b = (_a = (0, adts_header_1.readAdtsHeader)(streamBuffer.getBuffer())) === null || _a === void 0 ? void 0 : _a.frameLength) !== null && _b !== void 0 ? _b : null;
    if (expectedLength === null) {
        return false;
    }
    if (expectedLength > streamBuffer.getBuffer().length) {
        return false;
    }
    return true;
};
exports.canProcessAudio = canProcessAudio;
const processAudio = async ({ transportStreamEntry, structure, offset, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }) => {
    var _a, _b;
    const { streamBuffers, nextPesHeaderStore: nextPesHeader } = transportStream;
    const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
    if (!streamBuffer) {
        throw new Error('Stream buffer not found');
    }
    const expectedLength = (_b = (_a = (0, adts_header_1.readAdtsHeader)(streamBuffer.getBuffer())) === null || _a === void 0 ? void 0 : _a.frameLength) !== null && _b !== void 0 ? _b : null;
    if (expectedLength === null) {
        throw new Error('Expected length is null');
    }
    if (expectedLength > streamBuffer.getBuffer().length) {
        throw new Error('Expected length is greater than stream buffer length');
    }
    await (0, process_stream_buffers_1.processStreamBuffer)({
        streamBuffer: (0, process_stream_buffers_1.makeTransportStreamPacketBuffer)({
            buffers: streamBuffer.getBuffer().slice(0, expectedLength),
            offset,
            pesHeader: streamBuffer.pesHeader,
        }),
        programId: transportStreamEntry.pid,
        structure,
        sampleCallbacks,
        logLevel,
        onAudioTrack,
        onVideoTrack,
        transportStream,
        makeSamplesStartAtZero,
        avcState,
    });
    const rest = streamBuffer.getBuffer().slice(expectedLength);
    streamBuffers.set(transportStreamEntry.pid, (0, process_stream_buffers_1.makeTransportStreamPacketBuffer)({
        buffers: rest,
        pesHeader: nextPesHeader.getNextPesHeader(),
        offset,
    }));
};
exports.processAudio = processAudio;
