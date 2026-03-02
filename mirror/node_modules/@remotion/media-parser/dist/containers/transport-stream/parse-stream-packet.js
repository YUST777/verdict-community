"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStream = void 0;
const discard_rest_of_packet_1 = require("./discard-rest-of-packet");
const process_stream_buffers_1 = require("./process-stream-buffers");
const parseStream = ({ transportStreamEntry, programId, iterator, transportStream, }) => {
    const restOfPacket = (0, discard_rest_of_packet_1.getRestOfPacket)(iterator);
    const offset = iterator.counter.getOffset();
    const { streamBuffers, nextPesHeaderStore: nextPesHeader } = transportStream;
    if (!streamBuffers.has(transportStreamEntry.pid)) {
        streamBuffers.set(programId, (0, process_stream_buffers_1.makeTransportStreamPacketBuffer)({
            pesHeader: nextPesHeader.getNextPesHeader(),
            buffers: null,
            offset,
        }));
    }
    const streamBuffer = streamBuffers.get(transportStreamEntry.pid);
    streamBuffer.addBuffer(restOfPacket);
};
exports.parseStream = parseStream;
