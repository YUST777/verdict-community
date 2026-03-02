"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTransportStream = void 0;
const parse_packet_1 = require("./parse-packet");
const process_sample_if_possible_1 = require("./process-sample-if-possible");
const process_stream_buffers_1 = require("./process-stream-buffers");
const parseTransportStream = async (state) => {
    const structure = state.structure.getTsStructure();
    const processed = await (0, process_sample_if_possible_1.processSampleIfPossible)(state);
    if (processed) {
        return Promise.resolve(null);
    }
    const { iterator } = state;
    if (iterator.bytesRemaining() < 188) {
        return Promise.resolve(null);
    }
    const packet = (0, parse_packet_1.parsePacket)({
        iterator,
        structure,
        transportStream: state.transportStream,
    });
    if (packet) {
        structure.boxes.push(packet);
    }
    if (iterator.bytesRemaining() === 0) {
        await (0, process_stream_buffers_1.processFinalStreamBuffers)({
            transportStream: state.transportStream,
            structure,
            sampleCallbacks: state.callbacks,
            logLevel: state.logLevel,
            onAudioTrack: state.onAudioTrack,
            onVideoTrack: state.onVideoTrack,
            makeSamplesStartAtZero: state.makeSamplesStartAtZero,
            avcState: state.avc,
        });
    }
    return Promise.resolve(null);
};
exports.parseTransportStream = parseTransportStream;
